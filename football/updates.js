// Device-local read state, separate from tickets and office-pool selections.
let researchChanges={snapshot:{},unread:{}}, researchChangeKey='';
const pulsedUpdates=new Set();
const updateMetadata=new Set(['asOf','verifiedAt','researchedAt','researchReviewedAt','retrievedAt','capturedAt','frozenAt','updatedAt','updated_time','apiUpdatedTime','researchVersion','publishedAt']);
function meaningfulResearch(value){
  if(Array.isArray(value))return value.map(meaningfulResearch);
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().filter(k=>!updateMetadata.has(k)).map(k=>[k,meaningfulResearch(value[k])]));
  return value;
}
function researchSnapshot(d){
  const out={};
  for(const g of d.games){
    const parts={
      'Matchup and schedule':{kickoff:g.kickoff,away:g.away,home:g.home,status:g.status},
      'Player availability':{players:g.availability,impact:g.availabilityImpact},
      'Research':g.insights,
      ...((d.researchMarketEstimates||[]).some(q=>q.gameId===g.id)?{'Research market estimates':d.researchMarketEstimates.filter(q=>q.gameId===g.id)}:{}),
      'Market prices':(d.marketSnapshots||[]).filter(q=>q.gameId===g.id).sort((a,b)=>String(a.team).localeCompare(String(b.team)))
    };
    out['games:'+g.id]={label:g.away.name+' vs. '+g.home.name,parts};
    out['picks:'+g.id]={label:g.away.name+' vs. '+g.home.name,parts:{'AI pick and rationale':(d.predictions||[]).filter(p=>p.gameId===g.id)}};
  }
  for(const t of d.comboCandidates)out['combos:'+t.id]={label:'Ticket '+t.id+' · '+t.title,strategy:t.strategy,parts:{'Selections':t.legs,'Quote':t.quoteSnapshot,'Strategy and rationale':{type:t.type,strategy:t.strategy,title:t.title,status:t.status,research:t.researchReview}}};
  return meaningfulResearch(out);
}
function trackResearchChanges(d){
  researchChangeKey=`football-research-read-${d.season}-${d.week}`;
  let previous=null;try{previous=JSON.parse(localStorage.getItem(researchChangeKey))}catch{}
  const next=researchSnapshot(d),valid=previous?.snapshot&&previous?.unread;
  researchChanges={snapshot:next,unread:valid?previous.unread:{}};
  if(valid)for(const id of new Set([...Object.keys(previous.snapshot),...Object.keys(next)])){
    const old=previous.snapshot[id],now=next[id];
    if(JSON.stringify(old)===JSON.stringify(now))continue;
    const changes=!old?['New research published']:!now?['Removed from current research']:[...new Set([...Object.keys(now.parts),...Object.keys(old.parts)])].filter(k=>JSON.stringify(now.parts[k])!==JSON.stringify(old.parts[k])).map(k=>k+' changed');
    if(old&&now&&id.startsWith('picks:')){
      const before=old.parts['AI pick and rationale']?.[0]?.winner,after=now.parts['AI pick and rationale']?.[0]?.winner;
      if(before!==after)changes.push(`Pick: ${before||'Unpublished'} → ${after||'Unpublished'}`);
    }
    if(old&&now&&id.startsWith('games:')){
      const prices=old.parts['Market prices']||[];
      for(const q of now.parts['Market prices']||[]){const before=prices.find(p=>p.team===q.team);if(before&&before.yesAsk!==q.yesAsk)changes.push(`${q.team} YES ask: ${quotePercent(before.yesAsk)} → ${quotePercent(q.yesAsk)}`)}
      const players=old.parts['Player availability']?.players||[];
      for(const p of now.parts['Player availability']?.players||[]){const before=players.find(x=>x.name===p.name&&x.team===p.team);if(before&&before.status!==p.status)changes.push(`${p.name}: ${before.status} → ${p.status}`)}
    }
    if(changes.length)researchChanges.unread[id]={label:(now||old).label,strategy:(now||old).strategy,changes:[...new Set([...(researchChanges.unread[id]?.changes||[]),...changes])],detectedAt:new Date().toISOString()};
  }
  saveResearchReadState();
}
function saveResearchReadState(){try{localStorage.setItem(researchChangeKey,JSON.stringify(researchChanges))}catch{/* Read indicators must never interrupt the app. */}}
function matchingUpdates(scope){return Object.entries(researchChanges.unread).filter(([id,v])=>id===scope||id.startsWith(scope+':')||(scope.startsWith('strategy:')&&id.startsWith('combos:')&&v.strategy===scope.split(':')[1]));}
function updatePill(scope){
  const entries=matchingUpdates(scope);if(!entries.length)return '';
  const token=researchChangeKey+scope+entries.map(([id,v])=>id+v.detectedAt).join('|'),pulse=!pulsedUpdates.has(token);pulsedUpdates.add(token);
  return `<button class="update-pill${pulse?' update-pulse':''}" data-research-updates="${esc(scope)}" aria-label="Review ${entries.length} research update${entries.length===1?'':'s'}"><span aria-hidden="true" class="update-dot"></span>Updated${entries.length>1?' · '+entries.length:''}</button>`;
}
function syncResearchUpdates(){
  document.querySelectorAll('[data-update-host]').forEach(host=>{if(!host.querySelector('.update-pill'))host.insertAdjacentHTML('afterbegin',updatePill(host.dataset.updateHost))});
  document.querySelectorAll('[data-briefing],[data-plan]').forEach(card=>{
    const scope=card.dataset.briefing||'strategy:'+card.dataset.plan;
    if(!card.nextElementSibling?.classList.contains('update-pill'))card.insertAdjacentHTML('afterend',updatePill(scope));
  });

}
function openResearchUpdates(scope){
  const entries=matchingUpdates(scope);if(!entries.length)return;
  const latest=entries.map(([,v])=>v.detectedAt).sort().at(-1);
  openReviewSheet('What changed',`<p class="small muted">Changes detected ${esc(date(latest))} · Cancún</p>${entries.map(([,v])=>`<article class="briefing-item"><b>${esc(v.label)}</b><ul>${v.changes.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></article>`).join('')}<p class="small muted">Compared with the research previously loaded on this device. A source check alone does not count as an update.</p><div class="briefing-footer"><button class="primary" data-updates-reviewed="${esc(scope)}">Mark reviewed <i data-lucide="check"></i></button></div>`);
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.researchUpdates)openResearchUpdates(b.dataset.researchUpdates);
  if(b.dataset.updatesReviewed){for(const [id] of matchingUpdates(b.dataset.updatesReviewed))delete researchChanges.unread[id];saveResearchReadState();closeReviewSheet();render();icons();}
});
