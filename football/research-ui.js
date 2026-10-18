// Sourced research presentation. Never writes personal picks, tickets or quote values.
function publishedPicks() { return data.games.filter(g => forecast(g) || researchLean(g)); }
function gameQuotes(g) { return (data.marketSnapshots || []).filter(q => q.gameId === g.id); }
function quotePercent(v) { return Number.isFinite(v) ? (v * 100).toFixed(0) + '%' : 'Unavailable'; }
function marketLeader(g) { const qs=gameQuotes(g).filter(q=>Number.isFinite(q.yesAsk)).sort((a,b)=>b.yesAsk-a.yesAsk); return qs.length===2 && qs[0].yesAsk!==qs[1].yesAsk ? qs[0].team : null; }
function marketStrip(g) {
  const rows=[g.away,g.home].map(t=>({team:t,q:selectionMarket({gameId:g.id,team:t.name,side:'YES'})}));
  const first=rows[0].q,shared=first&&rows.every(r=>r.q&&r.q.label===first.label&&r.q.source===first.source&&r.q.capturedAt===first.capturedAt);
  return `<div class="market-strip"><div class="row between"><span><i data-lucide="chart-no-axes-combined"></i> Market signals</span><small>${shared?esc(first.label):'Recorded · YES'}</small></div><div class="market-sides">${rows.map(({team:t,q})=>`<div><b>${esc(teamAbbr(t.name))} ${q?quotePercent(q.value):'Unavailable'}</b>${!shared?`<small>${esc(q?.label||'No sourced price')}</small>${q?`<small>${esc(q.source)}</small><small>${esc(date(q.capturedAt))} · Cancún</small>`:''}`:''}</div>`).join('')}</div>${shared?`<small>${esc(first.source)}<br>${esc(date(first.capturedAt))} · Cancún</small>`:''}</div>`;
}

function sourceDisclosure(ids) { return `<details class="source-disclosure"><summary>Sources <i data-lucide="chevron-down" class="chev"></i></summary>${researchSources(ids)}</details>`; }
function availability(g) {
  return `<p class="small muted">Key availability updates · Final inactives pending</p>${[g.away,g.home].map(t=>{
    const rows=(g.availability||[]).filter(p=>p.team===t.name);
    return `<section class="availability-group">${team(t.name,t.record)}${rows.length ? rows.map(p=>`<div class="player-row"><i data-lucide="user-round"></i><div><b>${esc(p.name)}</b><small>${esc(p.positionName)} (${esc(p.position)})</small>${p.note?`<small class="muted">${esc(p.note)}</small>`:''}</div><span class="availability-status ${p.status==='Out'||p.status==='IR'||p.status==='Suspended'?'status-out':p.status==='Questionable'||p.status==='Doubtful'?'status-watch':'status-ready'}">${esc(p.status)}</span></div>`).join(''):'<p class="small muted">No player-level update verified in this snapshot; this does not mean everyone is available.</p>'}</section>`;
  }).join('')}${g.availabilityImpact?`<div class="soft small"><b>Matchup impact · analysis</b><p>${esc(g.availabilityImpact)}</p></div>`:''}`;
}
function marketDetails(g) {
  const qs=gameQuotes(g),p=forecast(g)||researchLean(g),leader=marketLeader(g);
  return `<p class="small">YES contract prices expressed as percentages. These are market signals, not AI win probabilities.</p>${qs.length?`<div class="quote-table" role="table" aria-label="Kalshi bid and ask snapshot"><div role="row"><b role="columnheader">Team</b><b role="columnheader">Bid</b><b role="columnheader">Ask</b></div>${qs.map(q=>`<div role="row"><span role="cell">${esc(q.team)}</span><b role="cell">${quotePercent(q.yesBid)}</b><b role="cell">${quotePercent(q.yesAsk)}</b></div>`).join('')}</div>`:'<p>No market snapshot available.</p>'}${p?`<p class="small"><b>Research comparison:</b> ${esc(p.winner)} lean. ${leader ? leader===p.winner?'The market favors the same team. Agreement alone does not establish value.':'The market favors '+esc(leader)+'. Review why the signals differ.':'No clear market favorite in this snapshot.'}</p>`:''}<details class="source-disclosure"><summary>How to read these prices <i data-lucide="chevron-down" class="chev"></i></summary><p class="small muted">Ask is the displayed buy price; bid is the displayed sell price. Prices may not sum to 100% because of the spread. Depth and fees are unverified. Check your actual quote in Kalshi. These game contracts specify a $0.50 settlement for a tie; check each contract’s rules.</p></details>`;
}
function insightCard(g,i) {
  const labels={form:['chart-no-axes-combined','Team Form'],injuries:['heart-pulse','Injuries & Availability'],matchup:['shield','Matchup Analysis'],market:['chart-line','Market & Probability'],history:['history','Historical Insights']},[icon,label]=labels[i.category];
  const unique=[...new Set(i.details||[])].filter(x=>x!==i.summary && !x.startsWith('Entering Week'));
  const body=i.category==='injuries'&&g.availability?availability(g):i.category==='market'?marketDetails(g):`<ul>${unique.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
  return `<details class="research-acc" data-research="${i.category}"><summary><i data-lucide="${icon}"></i><span><b>${label}</b><div class="muted small">${esc(i.summary)}</div></span><i data-lucide="chevron-down" class="chev"></i></summary><div class="details">${body}<p class="small muted">${i.category==='market'?'Market captured':'Research checked'}: ${esc(date(i.category==='market'?gameQuotes(g)[0]?.retrievedAt||i.asOf:i.asOf||data.researchedAt))} · Cancún</p>${sourceDisclosure(i.sourceIds||g.sourceIds)}</div></details>`;
}
function researchGame(g) { return `<article class="card game-research" data-update-host="games:${esc(g.id)}">${kickoff(g.kickoff)}${team(g.away.name,g.away.record)}${team(g.home.name,g.home.record)}${marketStrip(g)}${reviewActions(g)}<details class="research-acc research-group" data-research-group><summary><i data-lucide="clipboard-list"></i><span><b>Research insights</b><small class="muted">Form, injuries, matchup, market & history</small></span><i class="chev" data-lucide="chevron-down"></i></summary><div class="research-sections">${g.insights.map(i=>insightCard(g,i)).join('')}</div></details></article>`; }
function homeBriefings() {
  return `<div class="card"><div class="eyebrow">THIS WEEK’S INTELLIGENCE</div><h2>Week ${data.week} · ${data.season}</h2><div class="briefing-cards">${[['games','shield','Games',data.games.length,'Availability, recent form and market signals'],['picks','brain','AI Picks',publishedPicks().length,'Research leans · supporting and opposing evidence'],['combos','layers','Combo candidates',data.comboCandidates.length,'Plans A–E · shared exposure and timing']].map(([key,icon,label,count,desc])=>`<button class="briefing-card" data-briefing="${key}" aria-haspopup="dialog"><i data-lucide="${icon}"></i><span><b>${label} <span class="briefing-count">${count}</span></b><small>${desc}</small></span><i data-lucide="chevron-right"></i></button>`).join('')}</div><p class="small muted">Final inactives pending · Combo quotes historical</p></div>`;
}
function briefingGame(g,category) { const i=g.insights.find(x=>x.category===category);return `<article class="briefing-item">${team(g.away.name,g.away.record)}${team(g.home.name,g.home.record)}${kickoff(g.kickoff)}<p>${esc(category==='injuries' ? g.availabilityImpact : i?.summary||'Research pending')}</p>${category==='injuries' ? '<ul>'+g.availability.filter(p=>p.position==='QB').map(p=>'<li>'+esc(p.name)+' · '+esc(p.positionName)+' · '+esc(p.status)+(p.note?' — '+esc(p.note):'')+'</li>').join('')+'</ul>':''}${category==='form'?`<ul>${(i?.details||[]).slice(0,2).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}</article>`; }
function openBriefing(kind) {
  let title,body,label;
  if(kind==='games'){
    title='Weekly research';label='View all games';
    body=`<p>${data.games.length} upcoming games. Key updates before you review the matchups.</p><h3>Availability to watch</h3>${data.games.filter(g=>g.availability?.some(p=>p.position==='QB'&&p.status!=='Cleared')).map(g=>briefingGame(g,'injuries')).join('')}<h3>Matchup highlights</h3>${data.games.filter(g=>['hou-jax','no-nyg','buf-lv'].includes(g.id)).map(g=>briefingGame(g,'form')).join('')}`;
  }else if(kind==='picks'){
    title='AI Picks briefing';label='View AI Picks';const games=publishedPicks(),disagreements=games.filter(g=>marketLeader(g)&&marketLeader(g)!==(forecast(g)||researchLean(g)).winner);
    body=`<p><b>${games.length} research leans</b> · Numerical win probabilities remain unpublished.</p><div class="soft small">${disagreements.length?disagreements.length+' lean(s) differ from the market favorite.':'Current leans agree with market favorites.'} Market agreement is not a validated pricing edge.</div>${games.map(g=>{const p=forecast(g)||researchLean(g),t=[g.away,g.home].find(t=>t.name===p.winner);return `<article class="briefing-item">${team(t.name,t.record)}<small class="muted">vs. ${esc((g.away===t?g.home:g.away).name)} · ${esc(p.confidence)}</small><p>${esc(p.summary)}</p><small><b>Watch:</b> ${esc(p.opposingEvidence?.[0]||'Final availability')}</small></article>`}).join('')}`;
  }else{
    title='Combo briefing';label='View combos';const counts={};for(const t of data.comboCandidates)for(const l of t.legs)counts[l.gameId]=(counts[l.gameId]||0)+1;
    body=`<p><b>${data.comboCandidates.length} candidates across Plans A–E</b>. Review singles and combinations together.</p><div class="soft"><b>Historical pricing</b><p>Candidate payouts are from October 15. Current per-leg snapshots do not establish a current combo payout or combined win probability.</p></div><h3>Choose a strategy</h3>${[['A','Single + Combo','Pair a single with a related combination.'],['B','Simultaneous Games','Games in the same kickoff window.'],['C','Staggered Games','Different windows for review checkpoints.'],['D','Undefeated Teams','Compare unbeaten teams and their downside.'],['E','Losing-Team Streaks','NO positions against struggling teams.']].map(([id,name,desc])=>`<div class="briefing-item"><b>Plan ${id} · ${name}</b><p class="small">${desc} ${data.comboCandidates.filter(t=>t.strategy===id).length} candidates.</p></div>`).join('')}<h3>Repeated games across candidates</h3>${Object.entries(counts).filter(([id,n])=>n>1).sort((a,b)=>b[1]-a[1]).map(([id,n])=>{const g=data.games.find(g=>g.id===id);return `<article class="briefing-item">${team(g.away.name,g.away.record)}${team(g.home.name,g.home.record)}<p class="small">Appears in ${n} candidate tickets. One result can affect several tickets.</p>${kickoff(g.kickoff)}</article>`}).join('')}<p class="small muted">These counts describe the candidate library, not your saved portfolio. Review your actual shared exposure in Kalshi.</p>`;
  }
  openReviewSheet(title,`<p class="small muted">Week ${data.week} · Updated ${esc(date(data.researchedAt))} · Cancún</p>${body}<div class="briefing-footer"><button class="primary" data-briefing-go="${kind}">${label}<i data-lucide="arrow-right"></i></button></div>`);
  document.querySelector('[data-review-close]').setAttribute('aria-label','Close weekly briefing');
}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.briefing)openBriefing(b.dataset.briefing);if(b.dataset.briefingGo){closeReviewSheet();tab=b.dataset.briefingGo;sub='';plan='';render();icons();window.scrollTo(0,0);}});

// Read-only signals. Never substitute an opposing team's YES for this team's NO.
function selectionMarket(l,scope={}) {
  if(!data||l.side==='PROP'||!['YES','NO'].includes(l.side))return null;
  if((scope.week!=null&&Number(scope.week)!==Number(data.week))||(scope.season!=null&&Number(scope.season)!==Number(data.season)))return null;
  const valid=p=>Number.isFinite(p)&&p>=0&&p<=1;
  const qs=(data.marketSnapshots||[]).filter(q=>q.gameId===l.gameId&&q.team===l.team&&valid(q[l.side==='YES'?'yesAsk':'noAsk'])&&Number.isFinite(Date.parse(q.retrievedAt))&&(q.ticker?.startsWith('KXNFL')||q.sourceUrl?.includes('kalshi.com/'))).sort((a,b)=>Date.parse(b.retrievedAt)-Date.parse(a.retrievedAt));
  if(qs.length){const q=qs[0];return {value:q[l.side==='YES'?'yesAsk':'noAsk'],label:'Kalshi '+l.side+' ask',source:'Historical snapshot · Before fees',capturedAt:q.retrievedAt};}
  if(preferences.marketSource==='kalshi')return null;
  const estimates=(data.researchMarketEstimates||[]).filter(q=>q.gameId===l.gameId&&q.team===l.team&&q.side===l.side&&valid(q.probability)&&Number.isFinite(Date.parse(q.capturedAt))&&q.sourceName&&/^https:\/\//.test(q.sourceUrl||'')).sort((a,b)=>Date.parse(b.capturedAt)-Date.parse(a.capturedAt));
  if(!estimates.length)return null;
  const q=estimates[0];return {value:q.probability,label:'Research market estimate · '+l.side,source:q.sourceName,capturedAt:q.capturedAt};
}
function selectionMarketBlock(l,scope={}) {
  if(l.side==='PROP')return '';
  const q=selectionMarket(l,scope);
  return `<div class="selection-market"><div class="selection-market-top"><span>${esc(q?.label||'Market estimate')}</span><strong>${q?quotePercent(q.value):'Unavailable'}</strong></div>${q?`<small>${esc(q.source)}</small><small>Captured ${esc(date(q.capturedAt))} · Cancún</small>`:'<small>No sourced price for this selection.</small>'}</div>`;
}
