/* Long detail views share one drawer; page summaries remain available for comparison. */
function prepareDetailDrawers(){
 const view=document.querySelector('#view');if(!view)return;
 const selectors='.ticket-fold, .paper-ticket > details, [data-research-group], .pick-card [data-research-detail]';
 view.querySelectorAll(selectors).forEach(fold=>{
  const summary=fold.querySelector(':scope > summary');if(!summary)return;
  const card=fold.closest('article'),ticketId=card?.dataset.ticketId;
  const title=ticketId?tickets.find(t=>t.id===ticketId)?.title:fold.matches('[data-research-group]')?'Game research':fold.closest('.paper-ticket')?'AI paper result':'Why this selection?';
  const button=document.createElement('button');button.type='button';button.className=summary.className+' detail-link';button.setAttribute('aria-haspopup','dialog');button.dataset.openDetail=title||'Details';
  if(ticketId)button.dataset.ticketDetails=ticketId;
  button.innerHTML=summary.innerHTML;button.querySelector(':scope > .chev')?.remove();button.insertAdjacentHTML('beforeend','<i class="detail-chevron" data-lucide="chevron-right" aria-hidden="true"></i>');
  const template=document.createElement('template');summary.remove();template.innerHTML=fold.innerHTML;
  button._detailContent=template;button._detailContext=card?.matches('.game-research,.pick-card')?[...card.querySelectorAll(':scope > .team, :scope > .kickoff-row')].map(el=>el.outerHTML).join(''):'';
  if(fold.matches('[data-research-group]')){button.classList.add('research-detail-link');button.querySelector('b').textContent='View game research';}
  const choice=fold.querySelector('.draft-combine-choice');
  fold.replaceWith(button);if(choice)button.after(choice);
 });
}
function openDetailDrawer(button){
 const id=button.dataset.ticketDetails;
 let html=button._detailContext+button._detailContent.innerHTML;
 if(id){const t=tickets.find(t=>t.id===id);if(!t)return;const holder=document.createElement('template');holder.innerHTML=ticketView(t);holder.content.querySelector('.draft-combine-choice')?.remove();html=`<article class="ticket refined-ticket drawer-ticket" data-ticket-id="${esc(id)}">${holder.content.querySelector('.ticket-content').outerHTML}</article>`;}
 openReviewSheet(button.dataset.openDetail,html);
 reviewDialog().classList.add('detail-sheet');
}
document.addEventListener('click',e=>{const button=e.target.closest('[data-open-detail]');if(button)openDetailDrawer(button)});

// Read-only navigation within the existing drawer. Retain the actual ticket DOM
// so form values, expanded sections and scroll position survive the round trip.
function ticketResearchGame(t,l){
 if(!data || weekOf(t)!==Number(data.week) || Number(t.season||2026)!==Number(data.season))return null;
 return [...(data.games||[]),...(data.completedGames||[])].find(g=>g.id===l.gameId);
}
function ticketResearchTime(g){return g.researchReviewedAt||data.researchedAt;}
function ticketResearchLink(t,l){
 const g=ticketResearchGame(t,l);
 if(!g)return '<p class="small muted">Game research unavailable for this selection.</p>';
 const checked=ticketResearchTime(g);
 return `<button type="button" class="detail-link ticket-research-link" data-ticket-research="${esc(t.id)}" data-research-leg="${t.legs.indexOf(l)}" aria-haspopup="dialog" aria-label="View game research: ${esc(g.away.name)} vs ${esc(g.home.name)}"><span><b>View game research</b><small class="muted">${checked?'Research updated '+esc(date(checked))+' · Cancún':'Research timestamp unavailable'}</small></span><i class="detail-chevron" data-lucide="chevron-right" aria-hidden="true"></i></button>`;
}
function openTicketResearch(button){
 const t=tickets.find(t=>t.id===button.dataset.ticketResearch),l=t?.legs?.[Number(button.dataset.researchLeg)],g=l&&ticketResearchGame(t,l);
 if(!g)return;
 const d=reviewDialog(),content=d.querySelector('.sheet-content');if(!d.open||!content)return;
 flushSheetPricing();
 const frame={title:d.querySelector('h2').textContent,content:document.createDocumentFragment(),scroll:content.scrollTop,focus:button};
 while(content.firstChild)frame.content.append(content.firstChild);
 const checked=ticketResearchTime(g);
 openReviewSheet('Game research',`${team(g.away.name,g.away.record)}${team(g.home.name,g.home.record)}${kickoff(g.kickoff)}${gameScoreLine(g)}<p class="small muted">${checked?'Research updated '+esc(date(checked))+' · Cancún':'Research timestamp unavailable'} · Week ${data.week}</p><p class="small muted">Published research and market snapshots. Your ticket’s purchase quote stays unchanged.</p>${marketStrip(g)}<div class="research-sections">${(g.insights||[]).length?g.insights.map(i=>insightCard(g,i)).join(''):'<p>Detailed research has not been published for this game.</p>'}</div>`);
 d._ticketResearchReturn=frame;d.classList.add('detail-sheet');
 const bar=document.createElement('div');bar.className='sheet-returnbar';bar.innerHTML='<button type="button" data-back-to-ticket><i data-lucide="chevron-left" aria-hidden="true"></i> Back to ticket</button>';
 d.querySelector('.sheet-heading').after(bar);icons();bar.querySelector('button').focus({preventScroll:true});
}
function returnToResearchTicket(){
 const d=reviewDialog(),frame=d._ticketResearchReturn;if(!frame)return;
 openReviewSheet(frame.title,'');d.classList.add('detail-sheet');
 const content=d.querySelector('.sheet-content');content.append(frame.content);content.scrollTop=frame.scroll;
 if(frame.focus.isConnected)frame.focus.focus({preventScroll:true});
}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-ticket-research'))openTicketResearch(b);if(b.hasAttribute('data-back-to-ticket'))returnToResearchTicket();});
