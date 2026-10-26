import copy, importlib.util, json, unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('refresh', ROOT/'football/scripts/refresh_scores_markets.py')
refresh = importlib.util.module_from_spec(spec); spec.loader.exec_module(refresh)
class FinalRecords(unittest.TestCase):
    def setUp(self):
        self.week = json.loads((ROOT/'football/data/2026/week-06.json').read_text())
        self.game = copy.deepcopy(next(g for g in self.week['games'] if g['home']['name']=='San Francisco 49ers'))
        self.competitors = {s: {'team': {'displayName': self.game[s]['name']}, 'records':[{'type':'total','summary':self.game[s]['record']}]} for s in ('away','home')}
    def test_verified_record_and_idempotence(self):
        g=self.game
        self.assertEqual(g['home']['record'],'6-0-0'); self.assertEqual(g['home']['pregameRecord'],'5-0-0')
        original=copy.deepcopy(g)
        for _ in range(2): refresh.refresh_final_records(g,self.competitors,g['home']['recordAsOf'],g['home']['recordSource'])
        self.assertEqual(g,original)
        w7=json.loads((ROOT/'football/data/2026/week-07.json').read_text())
        sf=next(g for g in w7['games'] if g['id']=='sf-atl')['away']
        self.assertEqual(sf['pregameRecord'],'6-0-0'); self.assertEqual(sf['record'],'6-1-0')
    def test_invalid_records_fail_atomically(self):
        for records in ([],[{'type':'total','summary':'5-0'}],[{'type':'total','summary':'invalid'}]):
            with self.subTest(records=records):
                g=copy.deepcopy(self.game); competitors=copy.deepcopy(self.competitors);competitors['home']['records']=records
                with self.assertRaises(ValueError):refresh.refresh_final_records(g,competitors,'new','source')
                self.assertEqual(g,self.game)
    def test_unfinished_game_rejected(self):
        self.game['status']='live'
        with self.assertRaises(ValueError):refresh.refresh_final_records(self.game,self.competitors,'new','source')
    def test_every_final_preserves_pregame_and_has_provenance(self):
        w7=json.loads((ROOT/'football/data/2026/week-07.json').read_text())
        for g in self.week['games']+self.week['completedGames']+[g for g in w7['games'] if g['status']=='final']:
            for side in ('away','home'):
                team=g[side];self.assertTrue(team['recordSource'].startswith('https://'));self.assertIn('-05:00',team['recordAsOf'])
                if 'pregameRecord' in team:
                    before=list(map(int,team['pregameRecord'].split('-')));before += [0]*(3-len(before))
                    other='home' if side=='away' else 'away';before[0 if team['score']>g[other]['score'] else 1]+=1
                    self.assertEqual(team['record'],'-'.join(map(str,before)))
if __name__=='__main__':unittest.main()
