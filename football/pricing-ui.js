// Draft indications are separate from actual purchased terms and model probabilities.
function legQuote(t,l){
 if(t.status!=='draft'){const rows=t.pricingSnapshot?.legs,q=Array.isArray(rows)?rows.find(q=>q.gameId===l.gameId&&q.team===l.team&&q.side===l.side)?.quote:null;return q&&Number.isFinite(q.value)&&q.value>=0&&q.value<=1?q:null;}
 if(l.quotedPercent!=null&&Number.isFinite(l.quotedPercent)&&l.quotedPercent>=0&&l.quotedPercent<=100)return {value:l.quotedPercent/100,label:'Your entered quote',capturedAt:l.quotedAt||null};
 const q=selectionMarket(l,{week:weekOf(t),season:t.season});return q?{value:q.value,label:q.label+' · '+q.source,capturedAt:q.capturedAt}:null;
}
function legQuoteNote(t,l){const q=legQuote(t,l);return q?`${t.status==='draft'?'Using':'Locked'} ${(q.value*100).toFixed(2)}% · ${esc(q.label)}${q.capturedAt?' · '+esc(date(q.capturedAt)):''}`:'Unavailable · enter a quote for this exact outcome.';}
function legQuoteControl(t,l){const index=t.legs.indexOf(l),q=legQuote(t,l);if(t.status!=="draft")return `<div class="soft leg-quote"><div class="row between"><span>Quote at purchase</span><b>${q?(q.value*100).toFixed(2)+"%":"Not recorded"}</b></div>${q?`<small class="muted">${esc(q.label)}${q.capturedAt?" · "+esc(date(q.capturedAt)):""}</small>`:"<small class=muted>No quote was saved when this ticket was purchased.</small>"}</div>`;return `<div class="leg-quote"><label>Quoted probability (%) · ${l.side==='NO'?'Not to win':l.side==='PROP'?'Player prop':'To win'}<input type="number" min="0" max="100" step=".01" inputmode="decimal" data-leg-quote="${esc(t.id)}" data-leg-index="${index}" value="${esc(l.quotedPercent??'')}" placeholder="${q?(100*q.value).toFixed(2)+'% snapshot':'Unavailable'}" ${t.status==='draft'?'':'disabled'}></label><small class="muted" data-leg-quote-note="${index}">${legQuoteNote(t,l)}</small>${t.status==='draft'?'<small class="muted">Leave blank to use the available market snapshot. Enter a fresh percentage from Kalshi to override it.</small>':''}</div>`;}
function comboQuoteEstimate(t){
 const legs=t.legs||[];
 if(!legs.length||new Set(legs.map(l=>l.gameId)).size!==legs.length||legs.some(l=>!['YES','NO'].includes(l.side)))return null;
 const qs=legs.map(l=>legQuote(t,l));if(qs.some(q=>!q))return null;
 return qs.reduce((v,q)=>v*q.value,1);
}
function quoteEstimateBlock(t){const estimate=comboQuoteEstimate(t),combo=(t.legs||[]).length>1;return `<div class="soft quote-estimate"><div class="row between"><span>${combo?'Combined market estimate':'Selection market indication'}</span><b>${estimate==null?'Unavailable':(estimate*100).toFixed(2)+'%'}</b></div><p class="small muted">${combo?'Multiplies the per-game percentages, assuming independent outcomes. This is not an executable Kalshi combo quote or a validated win probability.':'Market indication only, not a validated win probability.'} ${estimate==null?'Every supported outcome needs a quote; same-game combinations and props are not estimated.':''}</p></div>`;}
function freezeTicketPricing(t){t.pricingSnapshot={recordedAt:new Date().toISOString(),legs:(t.legs||[]).map(l=>({gameId:l.gameId,team:l.team,side:l.side,quote:legQuote(t,l)}))};}
function updateTicketPricing(t){
 const target=document.querySelector(`[data-pricing-totals="${CSS.escape(t.id)}"]`);if(target)target.innerHTML=ticketPricingTotals(t);
 const card=document.querySelector(`[data-ticket-id="${CSS.escape(t.id)}"] .ticket-summary-main`);if(card){const temp=document.createElement("div");temp.innerHTML=ticketSummary(t);card.replaceWith(temp.firstElementChild);icons();}
 const firstMetric=document.querySelector('#view>.grid3 .metric b');if(tab==='kalshi'&&firstMetric)firstMetric.textContent=money(scopeTickets().filter(t=>t.status==='draft').reduce((n,t)=>n+Number(t.stake||0),0));
}
document.addEventListener('change',e=>{const input=e.target;if(!input.hasAttribute('data-leg-quote'))return;const t=tickets.find(t=>t.id===input.dataset.legQuote),index=Number(input.dataset.legIndex),l=t?.legs?.[index];if(!l||t.status!=='draft')return;const n=input.value===''?null:Number(input.value);
 if(input.validity.badInput||n!==null&&(!Number.isFinite(n)||n<0||n>100)){input.setCustomValidity('Enter a percentage from 0 to 100.');input.reportValidity();return;}
 input.setCustomValidity('');l.quotedPercent=n;if(n===null)delete l.quotedAt;else l.quotedAt=new Date().toISOString();save();const note=input.closest('.leg-quote').querySelector('[data-leg-quote-note]');note.innerHTML=legQuoteNote(t,l);updateTicketPricing(t);
});
document.addEventListener('input',e=>{if(e.target.hasAttribute('data-leg-quote')||e.target.hasAttribute('data-field'))e.target.setCustomValidity('')});

function ticketPricingTotals(t){const draft=t.status==="draft",closed=isClosed(t),be=Number(t.payout)>0?100*(Number(t.stake||0)+Number(t.fee||0))/Number(t.payout):null;return quoteEstimateBlock(t)+`<div class="soft"><div class="row between"><span>Break-even</span><b>${be === null ? "—" : be.toFixed(1) + "%"}</b></div><div class="row between"><span>${closed ? "Realized P&L" : "Potential profit"}</span><b>${draft && !(Number(t.payout) > 0) ? "—" : money(closed ? realizedNet(t) : ticketPotentialProfit(t))}</b></div><p class="small muted">Profit is after stake and recorded fees. ${!draft&&!closed?"Includes realized cash-outs plus the remaining payout if all selections win. Future exit fees are excluded. ":""}${t.validatedProbability != null ? "Validated probability: " + (100 * t.validatedProbability).toFixed(1) + "% · Expected net " + money(t.validatedProbability * Number(t.payout) - Number(t.stake) - Number(t.fee || 0)) : "Expected net unavailable · independent probability not validated."}</p></div>`;}

// UI state is memory-only. No save keys, financial records or migrations change.
let ticketExpansion = null;
let ticketInnerState = new Map();
function captureTicketState(){
 if(!ticketExpansion)ticketExpansion=new Map(tickets.map(t=>[t.id,false]));
 document.querySelectorAll('[data-ticket-id]').forEach(el=>{const id=el.dataset.ticketId;ticketExpansion.set(id,el.querySelector('.ticket-fold').open);ticketInnerState.set(id,[...el.querySelectorAll('.ticket-content details')].map(d=>d.open));});
}
function ticketExpanded(t){return ticketExpansion?.has(t.id)?ticketExpansion.get(t.id):t.status==='draft';}
function restoreTicketState(){document.querySelectorAll('[data-ticket-id]').forEach(el=>{const states=ticketInnerState.get(el.dataset.ticketId);if(states)el.querySelectorAll('.ticket-content details').forEach((d,i)=>{if(i<states.length)d.open=states[i]});});}
function ticketPotentialProfit(t){return t.status==='draft'?Number(t.payout||0)-Number(t.stake||0)-Number(t.fee||0):realizedNet(t)+Number(t.payout||0)*remaining(t)-basis(t);}
function ticketSummary(t){
 const closed=isClosed(t),draft=t.status==='draft',legs=t.legs||[];
 const profit=closed?realizedNet(t):ticketPotentialProfit(t);
 const times=legs.map(l=>data?.games.find(g=>g.id===l.gameId)?.kickoff||l.kickoff).filter(Boolean).sort();
 return `<div class="ticket-summary-main"><div class="row between"><b>${esc(t.title)}</b><span class="pill">${draft?'Draft':closed?'Closed':'Open bet'}</span></div><small>${legs.length} ${legs.length===1?'selection':'selections'} · ${esc(t.type||'Ticket')}</small><div class="ticket-summary-teams">${legs.map(l=>{const g=data?.games.find(g=>g.id===l.gameId);return `<span>${l.side==='PROP'?esc(l.prop||'Player prop'):team(l.team,g?.away.name===l.team?g.away.record:g?.home.record)}<small>${l.side==='NO'?'Not to win':l.side==='YES'?'To win':''}</small></span>`}).join('')}</div><div class="ticket-summary-money"><span>Stake <b>${money(Number(t.stake||0))}</b></span><span>${closed?'Realized P&L':'Potential profit'} <b>${!closed&&!(Number(t.payout)>0)?'—':money(profit)}</b></span></div>${times.length?`<small>First kickoff · ${esc(date(times[0]))}</small>`:''}</div><i class="chev" data-lucide="chevron-down"></i>`;
}

document.addEventListener('change',e=>{if(!e.target.hasAttribute('data-close-choice'))return;const root=e.target.closest('.details'),final=e.target.value==='final';root.querySelector('[data-close-sale]').hidden=final;root.querySelector('[data-close-final]').hidden=!final;});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-rename-ticket')){const t=tickets.find(t=>t.id===b.dataset.renameTicket);if(t)openReviewSheet('Rename ticket',`<label>Ticket name<input id="renameTicketName" maxlength="100" value="${esc(t.title)}"></label><p class="small muted">Only the name changes. Selections, prices and transaction history stay the same.</p><button class="primary" data-save-ticket-name="${esc(t.id)}">Save name</button>`);}if(b.hasAttribute('data-save-ticket-name')){const t=tickets.find(t=>t.id===b.dataset.saveTicketName),input=document.querySelector('#renameTicketName'),name=input?.value.trim();if(!t||!input)return;if(!name){input.setCustomValidity('Enter a ticket name.');input.reportValidity();return;}t.title=name;save();closeReviewSheet();render();icons();}});
document.addEventListener('input',e=>{if(e.target.id==='renameTicketName')e.target.setCustomValidity('')});
