"""Append-only public paper ledger. Never reads or writes personal tickets."""
import argparse, datetime as dt, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def instant(value):
    try:
        parsed=dt.datetime.fromisoformat(value.replace('Z','+00:00'))
        return parsed if parsed.tzinfo else None
    except (ValueError,TypeError,AttributeError): return None
def archive(d, ledger, now, retrospective=False):
    ids={e['id'] for e in ledger['entries']}
    games={g['id']:g for g in d.get('games',[])}
    candidates=[]
    for p in d.get('predictions',[]):
        if not p.get('modelVersion'): continue
        candidates.append(dict(id='single:'+p['gameId'],kind='single',title=p.get('winner'),publishedAt=p.get('frozenAt'),model=p['modelVersion'],rationale=p.get('summary',''),legs=[dict(gameId=p['gameId'],team=p.get('winner'),side='YES')]))
    for c in d.get('comboCandidates',[]):
        if c.get('origin')!='ai' or not c.get('modelVersion'): continue
        candidates.append(dict(id='combo:'+c['id'],kind='combo',title=c['title'],publishedAt=c.get('generatedAt'),model=c['modelVersion'],strategy=c.get('strategy'),legs=c.get('legs',[]),quote=c.get('quoteSnapshot')))
    for c in candidates:
        key=f"{d['season']}:{d['week']}:{c['id']}"
        if key in ids or not c['legs']: continue
        legs=c['legs']
        if len({l.get('gameId') for l in legs})!=len(legs) or (c['kind']=='combo' and len(legs)<2): continue
        if any(l.get('gameId') not in games or l.get('side') not in ('YES','NO') or l.get('prop') or l.get('period') or l.get('team') not in (games[l['gameId']]['away']['name'],games[l['gameId']]['home']['name']) for l in legs): continue
        starts=[instant(games[l['gameId']]['kickoff']) for l in legs]
        published=instant(c['publishedAt'])
        if not all(starts) or not published or published>=min(starts): continue
        if published>now or (not retrospective and now>=min(starts)): continue
        quote=None
        if c['kind']=='single':
            l=legs[0]
            qs=[q for q in d.get('marketSnapshots',[]) if q.get('gameId')==l['gameId'] and q.get('team')==l['team'] and instant(q.get('retrievedAt')) and published<=instant(q['retrievedAt'])<min(starts) and instant(q['retrievedAt'])<=now and q.get('sourceUrl') and isinstance(q.get('yesAsk'),(float,int)) and 0<q['yesAsk']<1]
            if qs:
                q=max(qs,key=lambda q:q['retrievedAt'])
                quote=dict(source=q['sourceUrl'],capturedAt=q['retrievedAt'],price=q['yesAsk'],payout=2/q['yesAsk'],method='Fractional $2 price benchmark; before trading costs')
        else:
            q=c.get('quote') or {};t=instant(q.get('capturedAt'))
            if t and t<=now and published<=t<min(starts) and q.get('source') and isinstance(q.get('stake'),(int,float)) and q['stake']>0 and isinstance(q.get('grossPayout'),(int,float)) and q['grossPayout']>0:
                quote=dict(source=q['source'],capturedAt=q['capturedAt'],payout=2*q['grossPayout']/q['stake'],method='Quoted ticket payout scaled to $2; before trading costs')
        saved={k:v for k,v in c.items() if k!='quote'}
        saved.update(id=key,season=d['season'],week=d['week'],stake=2,quote=quote,archivedAt=now.isoformat(),archiveMode='reconstructed-pregame' if retrospective else 'prospective',researchVersion=d.get('researchVersion'))
        saved['legs']=[dict(gameId=l['gameId'],team=l['team'],side=l['side'],kickoff=games[l['gameId']]['kickoff'],record=next(t['record'] for t in [games[l['gameId']]['away'],games[l['gameId']]['home']] if t['name']==l['team'])) for l in legs]
        ledger['entries'].append(saved);ids.add(key)
    return ledger
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--bootstrap',action='store_true');args=parser.parse_args()
    path=ROOT/'data/2026/ai-paper.json';ledger=json.loads(path.read_text()) if path.exists() else dict(schemaVersion=1,season=2026,entries=[])
    for path_in in sorted((ROOT/'data/2026').glob('week-*.json')):
        archive(json.loads(path_in.read_text()),ledger,dt.datetime.now(dt.timezone.utc),args.bootstrap)
    path.write_text(json.dumps(ledger,indent=2)+'\n')
