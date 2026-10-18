// Draft indications are separate from actual purchased terms and model probabilities.
function legQuote(t,l){
 if(t.status!=='draft'){const rows=t.pricingSnapshot?.legs,q=Array.isArray(rows)?rows.find(q=>q.gameId===l.gameId&&q.team===l.team&&q.side===l.side)?.quote:null;return q&&Number.isFinite(q.value)&&q.value>=0&&q.value<=1?q:null;}
 if(l.quotedPercent!=null&&Number.isFinite(l.quotedPercent)&&l.quotedPercent>=0&&l.quotedPercent<=100)return {value:l.quotedPercent/100,label:'Your entered quote',capturedAt:l.quotedAt||null};
 const q=selectionMarket(l,{week:weekOf(t),season:t.season});return q?{value:q.value,label:q.label+' · '+q.source,capturedAt:q.capturedAt}:null;
}
function legQuoteNote(t,l){const q=legQuote(t,l);return q?`${t.status==='draft'?'Using':'Locked'} ${(q.value*100).toFixed(2)}% · ${esc(q.label)}${q.capturedAt?' · '+esc(date(q.capturedAt)):''}`:'Unavailable · enter a quote for this exact outcome.';}
function legQuoteControl(t,l){const index=t.legs.indexOf(l),q=legQuote(t,l);return `<div class="leg-quote"><label>Quoted probability (%) · ${l.side==='NO'?'Not to win':l.side==='PROP'?'Player prop':'To win'}<input type="number" min="0" max="100" step=".01" inputmode="decimal" data-leg-quote="${esc(t.id)}" data-leg-index="${index}" value="${esc(l.quotedPercent??'')}" placeholder="${q?(100*q.value).toFixed(2)+'% snapshot':'Unavailable'}" ${t.status==='draft'?'':'disabled'}></label><small class="muted" data-leg-quote-note="${index}">${legQuoteNote(t,l)}</small>${t.status==='draft'?'<small class="muted">Leave blank to use the available market snapshot. Enter a fresh percentage from Kalshi to override it.</small>':''}</div>`;}
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
 const firstMetric=document.querySelector('#view>.grid3 .metric b');if(tab==='kalshi'&&firstMetric)firstMetric.textContent=money(scopeTickets().filter(t=>t.status==='draft').reduce((n,t)=>n+Number(t.stake||0),0));
}
document.addEventListener('change',e=>{const input=e.target;if(!input.hasAttribute('data-leg-quote'))return;const t=tickets.find(t=>t.id===input.dataset.legQuote),index=Number(input.dataset.legIndex),l=t?.legs?.[index];if(!l||t.status!=='draft')return;const n=input.value===''?null:Number(input.value);
 if(input.validity.badInput||n!==null&&(!Number.isFinite(n)||n<0||n>100)){input.setCustomValidity('Enter a percentage from 0 to 100.');input.reportValidity();return;}
 input.setCustomValidity('');l.quotedPercent=n;if(n===null)delete l.quotedAt;else l.quotedAt=new Date().toISOString();save();const note=input.closest('.leg-quote').querySelector('[data-leg-quote-note]');note.innerHTML=legQuoteNote(t,l);updateTicketPricing(t);
});
document.addEventListener('input',e=>{if(e.target.hasAttribute('data-leg-quote')||e.target.hasAttribute('data-field'))e.target.setCustomValidity('')});

function ticketPricingTotals(t){const draft=t.status==="draft",closed=isClosed(t),be=Number(t.payout)>0?100*(Number(t.stake||0)+Number(t.fee||0))/Number(t.payout):null;return quoteEstimateBlock(t)+`<div class="soft"><div class="row between"><span>Break-even</span><b>${be === null ? "—" : be.toFixed(1) + "%"}</b></div><div class="row between"><span>${closed ? "Realized net" : "Potential net at full payout"}</span><b>${draft && !(Number(t.payout) > 0) ? "—" : money(closed ? realizedNet(t) : Number(t.payout || 0) - Number(t.stake || 0) - Number(t.fee || 0))}</b></div><p class="small muted">${t.validatedProbability != null ? "Validated probability: " + (100 * t.validatedProbability).toFixed(1) + "% · Expected net " + money(t.validatedProbability * Number(t.payout) - Number(t.stake) - Number(t.fee || 0)) : "Expected net unavailable · independent probability not validated."}</p></div>`;}
