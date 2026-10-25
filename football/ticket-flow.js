// Shared research-to-ticket flow. Only drafts are editable here.
let activeReviewId = localStorage.getItem('football-active-draft') || '', reviewUndo = null, reviewPending = null, reviewEditor = null;
const originalReviewSync = syncReviewUI;
function reviewDrafts() { return scopeTickets().filter(t => t.status === 'draft'); }
function setActiveReview(id) { activeReviewId = id; localStorage.setItem('football-active-draft', id); }
function flushSheetPricing(){
 document.querySelectorAll('#ticketSheet [data-pricing-dirty]').forEach(input=>input.dispatchEvent(new Event('change',{bubbles:true})));
}
document.addEventListener('input',e=>{if(e.target.matches('#ticketSheet [data-field], #ticketSheet [data-leg-quote]'))e.target.dataset.pricingDirty='true'});
document.addEventListener('change',e=>{if(e.target.matches('[data-pricing-dirty]'))delete e.target.dataset.pricingDirty},true);
let sheetOrigin=null;
function reviewDialog() {
  let d = document.querySelector('#ticketSheet');
  if (!d) {
    d = document.createElement('dialog'); d.id = 'ticketSheet'; d.className = 'ticket-sheet';
    d.addEventListener('cancel',flushSheetPricing);
    d.addEventListener('close', () => { if(d.open)return;d.replaceChildren(); d._ticketResearchReturn=null; document.body.classList.remove('sheet-open'); const origin=sheetOrigin;sheetOrigin=null;if(origin&&origin.route===render.route){window.scrollTo(0,origin.y);if(origin.element?.isConnected)origin.element.focus({preventScroll:true});} });
    d.addEventListener('click', e => { if (e.target === d) { const r=d.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeReviewSheet(); } });
    document.body.append(d);
  }
  return d;
}
function openReviewSheet(title, html) {
  const d = reviewDialog();
  if(!d.open)sheetOrigin={element:document.activeElement,y:window.scrollY,route:render.route};
  flushSheetPricing();
  d._ticketResearchReturn=null;
  d.classList.remove('detail-sheet');
  d.innerHTML = `<div class="sheet-heading"><h2 id="ticketSheetTitle">${esc(title)}</h2><button data-review-close aria-label="Close ticket panel"><i data-lucide="x"></i></button></div><div class="sheet-content">${html}</div>`;
  d.setAttribute('aria-labelledby', 'ticketSheetTitle');
  const content=d.querySelector('.sheet-content'), footer=content.querySelector('.briefing-footer');
  if(footer)d.append(footer);
  if (!d.open) d.showModal();
  d.scrollTop=0; content.scrollTop=0;
  d.querySelector('[data-review-close]').focus({preventScroll:true});
  document.body.classList.add('sheet-open'); icons();
}
function closeReviewSheet() { const d=reviewDialog();flushSheetPricing();d.close();d.replaceChildren(); }
function legPresentation(l) {
  const g = data?.games.find(g => g.id === l.gameId), t = g && [g.away,g.home].find(t=>t.name===l.team);
  return `${l.side === 'PROP' ? `<b>${esc(l.prop || 'Player prop')}</b>` : team(l.team, t?.record || l.record)}<div class="small muted">${l.side==='NO'?'Not to win':l.side==='PROP'?'Player prop':'To win'}${l.source ? ' · '+esc(l.source):''}</div>${selectionMarketBlock(l)}${g || l.kickoff ? kickoff(g?.kickoff || l.kickoff) : ''}`;
}
function refreshReviewFlow() { save(); if(tab==='kalshi') render(); icons(); }
function rememberReview(t) { reviewUndo = {id:t.id, before:structuredClone(t)}; }
function reviewToast(message) {
  let el=document.querySelector('#ticketToast');
  if(!el){el=document.createElement('div');el.id='ticketToast';el.setAttribute('role','status');document.body.append(el)}
  el.innerHTML=`<span>${esc(message)}</span>${reviewUndo?'<button data-review-undo>Undo</button>':''}<button data-review-toast-close aria-label="Dismiss message"><i data-lucide="x"></i></button>`;
  icons();
}
function clearReviewPricing(t) {
  t.stake=null;t.payout=null;t.market=null;t.fee=0;
  delete t.validatedProbability; delete t.originalDrafts; delete t.candidateId;
  t.source='My review selections';t.pricingNeedsRefresh=true;
}
function newReviewTicket(kind, legs) {
  const n=1+Math.max(0,...tickets.filter(t=>t.season===2026&&weekOf(t)===Number($('#week').value)).map(t=>t.reviewNumber||0));
  const t={id:'review-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),season:2026,week:Number($('#week').value),title:`${kind==='combo'?'Combo':'Single'} #${n}`,reviewNumber:n,type:kind==='combo'?'Combo':'Single Game Bet',source:'My review selections',status:'draft',stake:null,payout:null,fee:0,market:null,proceeds:null,legs:structuredClone(legs),events:[],researchVersion:data?.researchVersion};
  tickets.push(t);setActiveReview(t.id);reviewUndo={id:t.id,before:null};return t;
}
addContextSelection = function(b) {
  const g=data?.games.find(g=>g.id===b.dataset.reviewGame), t=g&&[g.away,g.home].find(t=>t.name===b.dataset.reviewTeam);
  if(!t)return;
  reviewPending={gameId:g.id,team:t.name,side:'YES',marketPercent:null,kickoff:g.kickoff,record:t.record,opponent:(g.away.name===t.name?g.home:g.away).name,source:tab==='picks'?'AI Picks review':'Games research'};
  const combos=reviewDrafts().filter(t=>t.type==='Combo'||t.legs?.length>1).sort((a,b)=>(b.id===activeReviewId)-(a.id===activeReviewId));
  openReviewSheet('Add to ticket',`<div class="sheet-selection">${legPresentation(reviewPending)}${outcomeChoices(g,'YES',t.name)}</div><div class="sheet-destinations">${combos.map(t=>`<button data-review-append="${esc(t.id)}" ${t.legs.some(l=>l.gameId===g.id)?'disabled':''}><b>${esc(t.title)}${t.id===activeReviewId?' · Active':''}</b><small>${t.legs.some(l=>l.gameId===g.id)?'Game already included · edit the ticket to change it':t.legs.length+' legs · '+t.legs.map(l=>teamAbbr(l.team)).join(' + ')}</small></button>`).join('')}<button class="primary" data-review-new="combo"><i data-lucide="layers"></i> Start new combo</button><button data-review-new="single"><i data-lucide="plus"></i> Save as single</button></div>`);
};
function editReviewTicket(id) {
  const t=reviewDrafts().find(t=>t.id===id); if(!t)return;
  setActiveReview(id);reviewEditor=structuredClone(t);drawReviewEditor();
}
function drawReviewEditor() {
  const t=reviewEditor;
  openReviewSheet('Edit draft ticket',`<label>Ticket name<input id="reviewTitle" maxlength="100" value="${esc(t.title)}"></label>${t.legs.map((l,i)=>{const g=data?.games.find(g=>g.id===l.gameId);return `<div class="leg-row">${legPresentation(l)}<div class="row actions">${g&&l.side!=='PROP'?`<button data-review-switch="${i}">Choose other team</button><button data-review-side="${i}">${l.side==='NO'?'Change to win':'Change to not win'}</button>`:''}<button data-review-remove="${i}" aria-label="Remove ${esc(l.team||l.prop)}"><i data-lucide="trash-2"></i> Remove</button></div></div>`}).join('')}<p class="muted small">Changes to selections clear the old quote. Purchased tickets cannot be edited.</p><div class="sheet-destinations"><button class="primary" data-review-save>Save changes</button>${t.type==='Combo'?'<button data-review-more>Save & add another game</button>':''}<button data-review-finish>Save & review all drafts</button></div>`);
}
function saveReviewEditor() {
  const current=reviewDrafts().find(t=>t.id===reviewEditor?.id);if(!current)return false;
  const title=document.querySelector('#reviewTitle').value.trim();
  if(!title||!reviewEditor.legs.length){appAlert('Enter a ticket name and keep at least one selection.');return false}
  rememberReview(current);
  const changed=JSON.stringify(current.legs)!==JSON.stringify(reviewEditor.legs);
  if(changed)clearReviewPricing(reviewEditor);
  Object.assign(current,reviewEditor,{title});return true;
}
syncReviewUI = function() {
  originalReviewSync();
  const drafts=reviewDrafts(),active=drafts.find(t=>t.id===activeReviewId);
  let bar=document.querySelector('#activeTicketBar');if(!bar){bar=document.createElement('div');bar.id='activeTicketBar';document.querySelector('#bottomDock').prepend(bar);observeTicketBar(bar)}
  bar.hidden=!active||tab==='kalshi'||!!sub;
  bar.innerHTML=active?`<button class="active-ticket-name" data-review-tickets><b>${esc(active.title)} <i data-lucide="chevron-down"></i></b><small>${active.legs.length} ${active.legs.length===1?'selection':'legs'} · Active draft</small></button><button data-review-edit="${esc(active.id)}">Review ticket</button>`:'';
  document.body.classList.toggle('has-active-ticket',!bar.hidden);
  document.documentElement.style.setProperty('--active-ticket-height',bar.getBoundingClientRect().height+'px');
  document.querySelectorAll('[data-review-game]').forEach(b=>{
    b.disabled=false; const matches=drafts.filter(t=>t.legs?.some(l=>l.gameId===b.dataset.reviewGame&&l.team===b.dataset.reviewTeam));
    b.querySelector('.review-choice-state').textContent=matches.length?'In '+matches.length+' ticket'+(matches.length===1?'':'s'):'Add';
  });
  document.querySelectorAll('[data-add]').forEach(b=>{
    if(!b.parentElement.classList.contains('candidate-actions')){const group=document.createElement('div');group.className='button-group candidate-actions';b.before(group);group.append(b);}
    let edit=b.parentElement.querySelector('[data-review-candidate-edit="'+b.dataset.add+'"]');
    if(!edit){edit=document.createElement('button');edit.dataset.reviewCandidateEdit=b.dataset.add;b.after(edit)}
    edit.textContent=candidateInReview(b.dataset.add)?'Edit saved ticket':'Customize ticket';
  });
};
const originalCandidateAdd=addCandidateReview;
addCandidateReview=function(b){const before=tickets.length;originalCandidateAdd(b);if(tickets.length>before){const t=tickets[tickets.length-1];setActiveReview(t.id);reviewUndo={id:t.id,before:null};reviewToast(t.payout > 0 ? 'Saved your copy. Historical quote retained.' : 'Saved your copy. Ticket quote still needed.');}};
function reviewOverlap(t){
  const shared=(t.legs||[]).filter(l=>reviewDrafts().some(other=>other.id!==t.id&&other.legs?.some(x=>x.gameId===l.gameId)));
  return shared.length?`<p class="review-overlap"><i data-lucide="layers"></i> Shared games across drafts: ${esc([...new Set(shared.map(l=>teamAbbr(l.team)))].join(', '))}. Review combined exposure.</p>`:'';
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-review-close'))closeReviewSheet();
  if(b.hasAttribute('data-review-toast-close'))document.querySelector('#ticketToast')?.remove();
  if(b.hasAttribute('data-review-tickets'))openReviewSheet('Switch active ticket',`<div class="sheet-destinations">${reviewDrafts().map(t=>`<button data-review-active="${esc(t.id)}"><b>${esc(t.title)}${t.id===activeReviewId?' · Active':''}</b><small>${t.legs.length} selections · ${esc(t.type)}</small></button>`).join('')}</div>`);
  if(b.dataset.reviewActive){setActiveReview(b.dataset.reviewActive);closeReviewSheet();icons()}
  if(b.dataset.reviewEdit)editReviewTicket(b.dataset.reviewEdit);
  if(b.dataset.reviewCandidateEdit){let t=reviewDrafts().find(t=>t.candidateId===b.dataset.reviewCandidateEdit);if(!t){addCandidateReview({dataset:{add:b.dataset.reviewCandidateEdit},parentElement:b.parentElement,after:el=>b.after(el)});t=tickets[tickets.length-1]}if(t)editReviewTicket(t.id)}
  if(b.dataset.reviewNew||b.dataset.reviewAppend){
    const l={...reviewPending,side:document.querySelector('#reviewOutcome').value};let t;
    if(b.dataset.reviewNew){if(b.dataset.reviewNew==='single'&&reviewDrafts().some(t=>t.type!=='Combo'&&t.legs?.length===1&&t.legs[0].gameId===l.gameId&&t.legs[0].team===l.team&&t.legs[0].side===l.side)){appAlert('This single is already in your drafts.');return}t=newReviewTicket(b.dataset.reviewNew,[l]);}
    else {t=reviewDrafts().find(t=>t.id===b.dataset.reviewAppend);if(!t||t.legs.some(x=>x.gameId===l.gameId))return;rememberReview(t);t.legs.push(l);clearReviewPricing(t);setActiveReview(t.id)}
    closeReviewSheet();refreshReviewFlow();reviewToast('Added to '+t.title+'.');
  }
  if(b.hasAttribute('data-review-switch')||b.hasAttribute('data-review-side')||b.hasAttribute('data-review-remove')){
    reviewEditor.title=document.querySelector('#reviewTitle').value;
    const i=Number(b.dataset.reviewSwitch??b.dataset.reviewSide??b.dataset.reviewRemove),l=reviewEditor.legs[i];
    if(b.hasAttribute('data-review-remove'))reviewEditor.legs.splice(i,1);
    else if(b.hasAttribute('data-review-side')){l.side=l.side==='NO'?'YES':'NO';l.marketPercent=null;delete l.quotedPercent;delete l.quotedAt;l.source='My choice'}
    else {const g=data.games.find(g=>g.id===l.gameId),t=g.away.name===l.team?g.home:g.away;l.team=t.name;l.record=t.record;l.opponent=t===g.away?g.home.name:g.away.name;l.source='My choice';l.marketPercent=null;delete l.quotedPercent;delete l.quotedAt}
    drawReviewEditor();
  }
  if(b.hasAttribute('data-review-save')||b.hasAttribute('data-review-more')||b.hasAttribute('data-review-finish')){if(!saveReviewEditor())return;closeReviewSheet();if(b.hasAttribute('data-review-finish')){tab='kalshi';kalshiStage='build';sub='';plan='';}if(b.hasAttribute('data-review-more')){tab='games';sub='';plan='';render()}refreshReviewFlow();reviewToast('Draft updated.');}
  if(b.hasAttribute('data-review-undo')&&reviewUndo){const u=reviewUndo,t=tickets.find(t=>t.id===u.id);if(!t||t.status!=='draft'){reviewUndo=null;reviewToast('This ticket changed. Undo is no longer available.');return}if(u.before)tickets=tickets.map(t=>t.id===u.id?u.before:t);else tickets=tickets.filter(t=>t.id!==u.id);reviewUndo=null;refreshReviewFlow();reviewToast('Change undone.');}
});
// The ticket bar and navigation share one fixed containing block. Safari toolbar
// changes cannot move independently positioned layers over one another.
function measureBottomDock() {
  const root=document.documentElement,nav=document.querySelector('#bottomDock nav'),bar=document.querySelector('#activeTicketBar');
  if(nav)root.style.setProperty('--bottom-nav-height',nav.getBoundingClientRect().height+'px');
  root.style.setProperty('--active-ticket-height',bar&&!bar.hidden?bar.getBoundingClientRect().height+'px':'0px');
}
function observeTicketBar(bar) { new ResizeObserver(measureBottomDock).observe(bar); }
window.addEventListener('load',()=>{new ResizeObserver(measureBottomDock).observe(document.querySelector('#bottomDock'));measureBottomDock()});
window.addEventListener('pageshow',measureBottomDock);


document.addEventListener("change", e => { if(e.target.dataset.field || e.target.id === "week") { reviewUndo=null;document.querySelector("#ticketToast")?.remove(); } });

document.addEventListener('change',e=>{if(e.target.id==='reviewOutcome'&&reviewPending){const box=document.querySelector('.sheet-selection .selection-market');if(box)box.outerHTML=selectionMarketBlock({...reviewPending,side:e.target.value});}});
