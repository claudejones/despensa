// Office Pool choices reuse the existing pool store and never modify Kalshi tickets.
let picksView='analysis',poolFilter='all',performanceView='kalshi',poolFillPreview=null;
const poolResearchCache=new Map();let poolResultsLoading=false,poolResultsError='';
const poolKey=g=>`${data.season}-${data.week}-${g.id}`;
function poolChoice(g){const p=pool[poolKey(g)];return [g.away.name,g.home.name].includes(p)?p:null;}
function poolButtons(g){return `<div class="grid2 pool-team-choices">${[g.away,g.home].map(t=>`<button class="pick-btn ${poolChoice(g)===t.name?'selected':''}" aria-pressed="${poolChoice(g)===t.name}" aria-label="Pick ${esc(t.name)} to win" data-pool="${esc(g.id)}" data-team="${esc(t.name)}"><img src="assets/teams/${teamCode(t.name)}.png" alt="">${esc(teamAbbr(t.name))}${poolChoice(g)===t.name?'<i data-lucide="check"></i>':''}</button>`).join('')}</div>`;}
function poolChoiceStatus(g){const chosen=poolChoice(g);return `<div class="pool-current"><small>${chosen?'Your pick':'My Pool'}</small><b>${esc(chosen||'No team selected')}</b><div class="pool-actions"><button data-pool-choose="${esc(g.id)}">${chosen?'Change Pool pick':'Pick for My Pool'}</button>${chosen?`<button data-pool-clear="${esc(g.id)}">Clear</button>`:''}</div></div>`;}
function poolTabs(){return `<div class="plan-tabs" aria-label="AI and Office Pool views"><button data-picks-view="analysis" class="${picksView==='analysis'?'active':''}" aria-pressed="${picksView==='analysis'}">AI analysis</button><button data-picks-view="pool" class="${picksView==='pool'?'active':''}" aria-pressed="${picksView==='pool'}">My Pool</button></div>`;}
function myPoolScreen(){
 const count=data.games.filter(poolChoice).length,games=data.games.filter(g=>poolFilter!=='missing'||!poolChoice(g));
 return `<div class="card copybar"><div class="row between"><h2>My Pool</h2><b>${count} of ${data.games.length}</b></div><p class="muted">${data.games.length-count} ${data.games.length-count===1?"game still needs":"games still need"} a pick in this published slate.</p><div class="pool-toolbar"><button data-pool-fill ${count===data.games.length?'disabled':''}><i data-lucide="sparkles"></i> Fill missing picks from AI</button><button class="primary" data-action="copyPool" ${count?'':'disabled'}>Copy my picks</button></div><p class="small muted">Your choices stay independent of AI analysis and Kalshi tickets.</p><div class="plan-tabs"><button data-pool-filter="all" class="${poolFilter==='all'?'active':''}">All games</button><button data-pool-filter="missing" class="${poolFilter==='missing'?'active':''}">Missing picks</button></div></div>${games.length?games.map(g=>`<article class="card pool-card">${kickoff(g.kickoff)}${team(g.away.name,g.away.record)}${team(g.home.name,g.home.record)}${poolButtons(g)}<p class="small muted">${poolChoice(g)?'Your pick: '+esc(poolChoice(g)):'Choose one team to win.'}</p>${poolChoice(g)?`<button class="pool-clear" data-pool-clear="${esc(g.id)}">Clear pick</button>`:''}<button class="pool-analysis" data-pool-analysis="${esc(g.id)}">View AI analysis <i data-lucide="arrow-right"></i></button></article>`).join(''):'<div class="card"><h3>All picks complete</h3><p>Switch to All games to review or change a selection.</p></div>'}`;
}
function openPoolChooser(id){const g=data?.games.find(g=>g.id===id);if(!g)return;openReviewSheet('Choose your Pool pick',`${team(g.away.name,g.away.record)}${team(g.home.name,g.home.record)}${kickoff(g.kickoff)}<p class="small muted">One winner per game. This does not change your Kalshi tickets.</p>${poolButtons(g)}${poolChoice(g)?`<button class="pool-clear" data-pool-clear="${esc(g.id)}">Clear Pool pick</button>`:""}`);}
function setPoolChoice(id,name){const g=data?.games.find(g=>g.id===id);if(!g||name&&![g.away.name,g.home.name].includes(name))return;
 pool[poolKey(g)]=name;localStorage.setItem('football-pool-v03',JSON.stringify(pool));
 const openGames=[...document.querySelectorAll('.context-review[open]')].map(el=>el.dataset.game);
 if(document.querySelector('#ticketSheet')?.open)closeReviewSheet();render();icons();
 document.querySelectorAll('.context-review').forEach(el=>{if(openGames.includes(el.dataset.game))el.open=true});
}
function previewPoolFill(){
 const additions=data.games.filter(g=>!poolChoice(g)).map(g=>({g,p:forecast(g)||researchLean(g)})).filter(({g,p})=>p&&[g.away.name,g.home.name].includes(p.winner));
 poolFillPreview={season:data.season,week:data.week,additions:additions.map(({g,p})=>({id:g.id,winner:p.winner}))};
 openReviewSheet('Review AI additions',`<p>${additions.length} missing picks can be filled. Your existing selections will be preserved.</p><p class="small muted">These include qualitative research leans; they are not calibrated win probabilities.</p>${additions.map(({g,p})=>`<article class="briefing-item">${team(p.winner,(g.away.name===p.winner?g.away:g.home).record)}<small>vs. ${esc(g.away.name===p.winner?g.home.name:g.away.name)}</small><p>${esc(p.summary||'Published AI selection')}</p></article>`).join('')}<p class="small muted">${data.games.filter(g=>!poolChoice(g)).length-additions.length} missing picks have no published AI selection and will stay empty.</p><div class="briefing-footer"><button class="primary" data-pool-fill-confirm ${additions.length?'':'disabled'}>Add ${additions.length} picks to My Pool</button></div>`);
}
function rememberPoolResearch(d){poolResearchCache.set(`${d.season}-${d.week}`,d);}
async function loadPoolResults(){
 if(poolResultsLoading)return;poolResultsLoading=true;poolResultsError='';
 try{for(const [w,entry] of Object.entries(catalog.weeks||{})){
  if(poolResearchCache.has(`${catalog.season||2026}-${Number(w)}`))continue;
  if(!/^2026\/week-\d{2}\.json$/.test(entry.path||''))continue;
  const r=await fetch('data/'+entry.path,{cache:'no-store'});if(!r.ok)throw Error('Research could not be loaded');const d=await r.json();if(d.season!==2026||Number(d.week)!==Number(w)||!Array.isArray(d.games))throw Error('Invalid research');rememberPoolResearch(d);
 }}catch{poolResultsError='Some published results could not be loaded. Try again.'}finally{poolResultsLoading=false;if(sub==='results'&&performanceView==='pool'){render();icons()}}
}
function poolPerformanceStats(mode=perfMode){
 const season=2026,week=Number(document.querySelector('#week').value),rows=[];
 for(const [key,choice] of Object.entries(pool)){
  if(!choice||!key.startsWith(season+'-'))continue;const match=key.match(/^\d+-(\d+)-(.+)$/);if(!match||mode==='week'&&Number(match[1])!==week)continue;
  const d=poolResearchCache.get(`${season}-${Number(match[1])}`),g=d&&[...(d.games||[]),...(d.completedGames||[])].find(g=>g.id===match[2]);
  const final=g&&[g.away.name,g.home.name].includes(choice)&&/^final(?:-|$)/.test(g.status||'')&&Number.isFinite(g.away?.score)&&Number.isFinite(g.home?.score);
  const winner=final?(g.away.score===g.home.score?'tie':g.away.score>g.home.score?g.away.name:g.home.name):null;
  const p=d?.predictions?.find(p=>p.gameId===g?.id&&Date.parse(p.frozenAt)<Date.parse(g.kickoff)&&[g.away.name,g.home.name].includes(p.winner));
  rows.push({week:Number(match[1]),game:g,choice,result:!winner?'Pending':winner==='tie'?'Tie':winner===choice?'Correct':'Incorrect',ai:!winner||!p?'Unavailable':winner==='tie'?'Tie':p.winner===winner?'Correct':'Incorrect'});
 }
 return {rows,correct:rows.filter(r=>r.result==='Correct').length,incorrect:rows.filter(r=>r.result==='Incorrect').length,ties:rows.filter(r=>r.result==='Tie').length,pending:rows.filter(r=>r.result==='Pending').length};
}
function homePoolCard(){if(!data)return '';const count=data.games.filter(poolChoice).length;return `<button class="card home-pool home-performance" data-open-pool><div class="row between"><h3><i data-lucide="clipboard-list"></i> My Pool</h3><i data-lucide="chevron-right"></i></div><p>${count?`${count} of ${data.games.length} selected`:'Choose your weekly winners'}</p><small>One winner per game · Review and copy your picks</small></button>`;}
function homePerformanceCard(){const s=poolPerformanceStats('week'),rows=scopeTickets(),hasPool=s.rows.length>0;return `<button class="card home-performance" data-action="results"><div class="row between"><h3><i data-lucide="chart-no-axes-combined"></i> Performance</h3><i data-lucide="chevron-right"></i></div><small>Week ${Number(document.querySelector('#week').value)}</small><div class="${hasPool?'grid3':'grid2'}"><div><small>Realized P&L</small><b>${money(rows.reduce((n,t)=>n+realizedNet(t),0))}</b></div><div><small>Amount at risk</small><b>${money(rows.reduce((n,t)=>n+basis(t),0))}</b></div>${hasPool?`<div><small>Pool results</small><b>${s.correct+s.incorrect?`${s.correct} of ${s.correct+s.incorrect} correct`:s.pending?'Awaiting results':`${s.ties} tied`}</b></div>`:''}</div><small>${hasPool?'View Kalshi and Office Pool results':'View Kalshi results'}</small></button>`;}
function performanceTabs(){return `<div class="plan-tabs" aria-label="Performance views"><button data-performance-view="kalshi" class="${performanceView==='kalshi'?'active':''}">Kalshi</button><button data-performance-view="pool" class="${performanceView==='pool'?'active':''}">Office Pool</button><button data-performance-view="ai" class="${performanceView==='ai'?'active':''}">AI paper</button></div>`;}
function poolPerformanceScreen(){const s=poolPerformanceStats();return `<div class="plan-tabs"><button data-perf-mode="season" class="${perfMode==='season'?'active':''}">Season</button><button data-perf-mode="week" class="${perfMode==='week'?'active':''}">Selected Week</button></div><div class="card"><h2>Office Pool results</h2><p class="muted">Saved choices compared with published final scores.</p><div class="grid2">${metric('Correct',s.correct)}${metric('Incorrect',s.incorrect)}${metric('Pending',s.pending)}${metric('Ties',s.ties)}</div><p class="small muted">${poolResultsLoading?'Loading published results…':poolResultsError||'Final-score coverage: '+poolResearchCache.size+' published week(s) loaded.'} Pick submission timing is not verified; this is a comparison, not a verified submission record.</p>${poolResultsError?'<button data-pool-results-retry>Retry results</button>':''}</div>${s.rows.length?s.rows.map(r=>`<article class="card"><small>Week ${r.week}</small>${team(r.choice,r.game&&[r.game.away,r.game.home].find(t=>t.name===r.choice)?.record)}<div class="row between"><span>Your pick: ${r.result}</span><span>AI: ${r.ai}</span></div>${r.game&&r.result!=='Pending'?`<p class="small muted">${esc(r.game.away.name)} ${r.game.away.score} · ${esc(r.game.home.name)} ${r.game.home.score}</p>`:''}</article>`).join(''):'<div class="card"><p>No saved Pool picks in this view.</p></div>'}<button data-open-pool>Open My Pool</button>`;}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.picksView){picksView=b.dataset.picksView;render();icons()}
 if(b.dataset.poolFilter){poolFilter=b.dataset.poolFilter;render();icons()}
 if(b.dataset.poolChoose)openPoolChooser(b.dataset.poolChoose);
 if(b.dataset.poolClear)setPoolChoice(b.dataset.poolClear,null);
 if(b.hasAttribute('data-pool-fill'))previewPoolFill();
 if(b.hasAttribute('data-pool-fill-confirm')&&poolFillPreview){const preview=poolFillPreview;poolFillPreview=null;if(preview.season!==data?.season||preview.week!==data?.week)return;for(const a of preview.additions){const g=data.games.find(g=>g.id===a.id);if(g&&!poolChoice(g)&&[g.away.name,g.home.name].includes(a.winner))pool[poolKey(g)]=a.winner;}localStorage.setItem('football-pool-v03',JSON.stringify(pool));closeReviewSheet();picksView='pool';render();icons();}
 if(b.dataset.poolAnalysis){picksView='analysis';tab='picks';sub='';plan='';render();icons();document.querySelector(`[data-update-host="picks:${CSS.escape(b.dataset.poolAnalysis)}"]`)?.scrollIntoView({block:'start'});}
 if(b.dataset.performanceView){performanceView=b.dataset.performanceView;render();icons();if(performanceView==='pool')loadPoolResults();}
 if(b.hasAttribute('data-pool-results-retry'))loadPoolResults();
 if(b.hasAttribute('data-open-pool')){picksView='pool';tab='picks';sub='';plan='';render();icons();}
});
