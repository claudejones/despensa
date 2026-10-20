"""Refresh public scores/quotes; never edit forecasts or personal ledgers."""
import copy, datetime as dt, json, urllib.request, concurrent.futures
from pathlib import Path
TZ=dt.timezone(dt.timedelta(hours=-5))
def stamp(): return dt.datetime.now(TZ).isoformat(timespec='seconds')
def fetch(url):
    req=urllib.request.Request(url,headers={'User-Agent':'NFLIntelligence/1.8.1'})
    with urllib.request.urlopen(req,timeout=45) as response:
        return json.load(response)
def refresh_final_records(game, competitors, captured_at, source_url):
    """Use sourced overall records after a final; retain the original pregame snapshot."""
    if game['status'] != 'final':
        raise ValueError('Records require a final game')
    updates = []
    for side in ('away', 'home'):
        team, competitor = game[side], competitors[side]
        if competitor['team']['displayName'] != team['name']:
            raise ValueError('Record team mismatch')
        records = [r['summary'] for r in competitor.get('records', []) if r.get('type') == 'total']
        if len(records) != 1:
            raise ValueError('Missing or ambiguous overall record')
        parts = records[0].split('-')
        if len(parts) not in (2, 3) or not all(v.isdigit() for v in parts):
            raise ValueError('Invalid overall record')
        values = list(map(int, parts)) + ([0] if len(parts) == 2 else [])
        prior = team.get('pregameRecord', team.get('record'))
        if prior:
            expected = list(map(int, prior.split('-')))
            if len(expected) == 2: expected.append(0)
            other = 'home' if side == 'away' else 'away'
            index = 0 if team['score'] > game[other]['score'] else 1 if team['score'] < game[other]['score'] else 2
            expected[index] += 1
            if expected != values:
                raise ValueError('Overall record does not match pregame record and final score')
        updates.append((team, prior, '-'.join(map(str, values))))
    for team, prior, record in updates:
        if prior: team.setdefault('pregameRecord', prior)
        team.update(record=record, recordAsOf=captured_at, recordSource=source_url)

def main():
    path=Path('football/data/2026/week-06.json')
    data=json.loads(path.read_text()); original=copy.deepcopy(data)
    events=[]
    for date in sorted({g['kickoff'][:10].replace('-','') for g in data['games']}):
        events.extend(fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates='+date)['events'])
    score_at=stamp()
    lookup={tuple(sorted(c['team']['displayName'] for c in e['competitions'][0]['competitors'])):e for e in events}
    def quote(q): return q['ticker'],fetch(q['sourceUrl'])['market'],stamp()
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        markets={ticker:(market,time) for ticker,market,time in pool.map(quote,data['marketSnapshots'])}
    for game in data['games']:
        event=lookup[tuple(sorted([game['away']['name'],game['home']['name']]))]
        status=event['status']['type']
        competitors={c['homeAway']:c for c in event['competitions'][0]['competitors']}
        game['status']='final' if status['completed'] else 'live' if status['state']=='in' else 'scheduled'
        game.update(scoreCheckedAt=score_at,scoreDetail=status['detail'],scoreSource='https://www.espn.com/nfl/game/_/gameId/'+event['id'])
        for side in ['away','home']: game[side]['score']=int(competitors[side]['score'])
        if game['status']=='final':
            refresh_final_records(game, competitors, score_at, game['scoreSource'])
            assert game['away']['score']!=game['home']['score'], 'Tie requires manual market review'
            winner=max(['away','home'],key=lambda s:game[s]['score'])
            quotes=[q for q in data['marketSnapshots'] if q['gameId']==game['id']]
            assert len(quotes)==2
            for q in quotes:
                market,_=markets[q['ticker']]
                assert market['status']=='finalized'
                assert market['result']==('yes' if q['team']==game[winner]['name'] else 'no')
            game['result']={'verified':True,'marketScope':'full-game-winner','verifiedAt':score_at,'sources':[game['scoreSource']]+[q['sourceUrl'] for q in quotes]}
        else: game.pop('result',None)
    settlements=[]
    for q in data['marketSnapshots']:
        market,time=markets[q['ticker']]
        if market['status']=='active':
            previous=copy.deepcopy(q)
            for key,field in [('yesBid','yes_bid_dollars'),('yesAsk','yes_ask_dollars'),('noBid','no_bid_dollars'),('noAsk','no_ask_dollars')]:
                q[key]=float(market[field]); assert 0<=q[key]<=1
            assert q['yesBid']<=q['yesAsk'] and q['noBid']<=q['noAsk']
            if any(previous[k]!=q[k] for k in ['yesBid','yesAsk','noBid','noAsk']):
                data.setdefault('marketSnapshotHistory',[]).append(previous)
            q.update(retrievedAt=time,apiUpdatedTime=market.get('updated_time'),marketStatus='active',executableNow=False,depthVerified=False)
        elif market['status']=='finalized':
            q.update(marketStatus='finalized',marketCheckedAt=time)
            settlements.append(dict(gameId=q['gameId'],team=q['team'],ticker=q['ticker'],status='finalized',result=market['result'],settlementValue=float(market['settlement_value_dollars']),verifiedAt=time,sourceUrl=q['sourceUrl']))
        else: raise ValueError('Unexpected market state: '+market['status'])
    finals=sum(g['status']=='final' for g in data['games'])
    live=sum(g['status']=='live' for g in data['games'])
    scheduled=sum(g['status']=='scheduled' for g in data['games'])
    now=stamp(); version=now.replace(':','').replace('-','')
    data.update(marketSettlements=settlements,scoresCheckedAt=score_at,marketsCheckedAt=max(t for _,t in markets.values()),resultsVersion=version+'-scores',dataVersion=version+'-markets')
    data['notes']='Scores and market snapshots refreshed. Original pregame research, AI leans and combo quotes remain unchanged. Final outcomes verified against ESPN and Kalshi settlement records. Completed markets retain historical prices. Week remains open until all games finish.'
    data['coverage'].update(upcomingGames=scheduled,completedGames=finals+len(data['completedGames']),liveGames=live)
    data['researchQuality'].update(activeQuotesRefreshed=sum(m['status']=='active' for m,_ in markets.values()),finalizedMarketsVerified=len(settlements))
    assert data['predictions']==original['predictions'] and data['comboCandidates']==original['comboCandidates']
    assert len({g['id'] for g in data['games']})==len(data['games'])
    manifest_path=Path('football/data/manifest.json');manifest=json.loads(manifest_path.read_text())
    manifest['weeks']['06'].update(resultsVersion=data['resultsVersion'],dataVersion=data['dataVersion'])
    manifest.update(lastSuccessfulPublication=now,scoresCheckedAt=score_at,marketsCheckedAt=data['marketsCheckedAt'],notice=f'Week 6: {finals} Sunday finals, {live} live, {scheduled} scheduled. Original research and personal records preserved.')
    for p,obj in [(path,data),(manifest_path,manifest)]:
        p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
        print('REFRESH_FILE '+json.dumps({'path':str(p),'content':obj},ensure_ascii=False))
    print('REFRESH_SUMMARY '+manifest['notice'])
if __name__=='__main__': main()
