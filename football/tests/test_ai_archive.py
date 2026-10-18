import importlib.util, unittest, datetime as dt, copy
from pathlib import Path
spec=importlib.util.spec_from_file_location('archive',Path(__file__).parents[1]/'scripts/archive-ai-paper.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class ArchiveTests(unittest.TestCase):
 def test_immutable_and_pregame(self):
  d={'season':2026,'week':7,'games':[{'id':'g','kickoff':'2026-10-25T12:00:00-05:00','away':{'name':'A','record':'1-0-0'},'home':{'name':'B','record':'0-1-0'}}],'predictions':[{'gameId':'g','winner':'A','frozenAt':'2026-10-24T12:00:00-05:00','modelVersion':'ai'}],'comboCandidates':[]}
  now=m.instant('2026-10-24T13:00:00-05:00');ledger={'entries':[]};m.archive(d,ledger,now);self.assertEqual(len(ledger['entries']),1);self.assertIsNone(ledger['entries'][0]['quote']);saved=copy.deepcopy(ledger);d['predictions'][0]['winner']='B';m.archive(d,ledger,now);self.assertEqual(saved,ledger)
  late={'entries':[]};m.archive(d,late,m.instant('2026-10-25T13:00:00-05:00'));self.assertFalse(late['entries'])
 def test_user_combo_excluded(self):
  d={'season':2026,'week':7,'games':[],'comboCandidates':[{'id':'A','origin':'user'}]};out={'entries':[]};m.archive(d,out,dt.datetime.now(dt.timezone.utc));self.assertFalse(out['entries'])
 def test_ai_combo_quote_and_late_quote(self):
  d={'season':2026,'week':7,'games':[{'id':'g','kickoff':'2026-10-25T12:00:00-05:00','away':{'name':'A','record':'1-0-0'},'home':{'name':'B','record':'0-1-0'}}],'comboCandidates':[{'id':'c','origin':'ai','modelVersion':'ai-v1','title':'AI combo','generatedAt':'2026-10-24T12:00:00-05:00','legs':[{'gameId':'g','team':'A','side':'YES'}], 'quoteSnapshot':{'stake':4,'grossPayout':12,'capturedAt':'2026-10-24T12:30:00-05:00','source':'Recorded quote'}}]}
  second=copy.deepcopy(d['games'][0]);second['id']='h';d['games'].append(second);d['comboCandidates'][0]['legs'].append({'gameId':'h','team':'A','side':'YES'})
  now=m.instant('2026-10-24T13:00:00-05:00');ledger={'entries':[]};m.archive(d,ledger,now);self.assertEqual(ledger['entries'][0]['quote']['payout'],6)
  d['comboCandidates'][0]['quoteSnapshot']['capturedAt']='2026-10-25T13:00:00-05:00';ledger={'entries':[]};m.archive(d,ledger,now);self.assertIsNone(ledger['entries'][0]['quote'])
if __name__=='__main__':unittest.main()
