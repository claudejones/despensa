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
