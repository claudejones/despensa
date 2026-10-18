const preferenceDefaults={startScreen:'weeks',researchExpanded:false,updateAnimation:true,timeFormat:'12'};
function validatedPreferences(value={}){
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid app preferences');
  const result={...preferenceDefaults,...value};
  if(!['weeks','games','picks','combos','kalshi'].includes(result.startScreen)||typeof result.researchExpanded!=='boolean'||typeof result.updateAnimation!=='boolean'||!['12','24'].includes(result.timeFormat))throw Error('Invalid app preferences');
  return Object.fromEntries(Object.keys(preferenceDefaults).map(k=>[k,result[k]]));
}
let preferences;try{preferences=validatedPreferences(JSON.parse(localStorage.getItem('football-preferences-v1')||'{}'))}catch{preferences={...preferenceDefaults}}
function savePreferences(){localStorage.setItem('football-preferences-v1',JSON.stringify(preferences));}
function applyPreferences(){
  document.body.classList.toggle('no-update-animation',!preferences.updateAnimation);
  document.querySelectorAll('[data-research], [data-research-detail]').forEach(el=>{if(el.dataset.preferenceApplied)return;el.dataset.preferenceApplied='true';el.open=preferences.researchExpanded});
}
function settingsScreen(){return `<div class="settings-head"><h2>Make it yours</h2><p class="muted">Preferences save automatically on this device.</p></div><section class="card preference-card"><h3><i data-lucide="sliders-horizontal"></i> App experience</h3>
<label class="preference-row" for="prefStart"><span><b>Start screen</b><small>Where the app opens next time.</small></span><select id="prefStart" data-preference="startScreen">${[['weeks','Home'],['games','Games'],['picks','AI Picks'],['combos','Combos'],['kalshi','Kalshi']].map(([v,n])=>`<option value="${v}" ${preferences.startScreen===v?'selected':''}>${n}</option>`).join('')}</select></label>
<label class="preference-row" for="prefResearch"><span><b>Expand research by default</b><small>Open research details and AI rationale when viewing a screen.</small></span><input type="checkbox" role="switch" id="prefResearch" data-preference="researchExpanded" ${preferences.researchExpanded?'checked':''}></label>
<label class="preference-row" for="prefPulse"><span><b>Animate update badges</b><small>Two gentle pulses. Updated badges remain visible when off.</small></span><input type="checkbox" role="switch" id="prefPulse" data-preference="updateAnimation" ${preferences.updateAnimation?'checked':''}></label>
<label class="preference-row" for="prefTime"><span><b>Time format</b><small>All times stay in Cancún.</small></span><select id="prefTime" data-preference="timeFormat"><option value="12" ${preferences.timeFormat==='12'?'selected':''}>12-hour</option><option value="24" ${preferences.timeFormat==='24'?'selected':''}>24-hour</option></select></label><p class="small muted" id="timePreview">Example: ${esc(date('2026-10-18T19:20:00-05:00'))}</p><p class="small preference-saved" id="preferenceSaved" role="status"></p></section>
<section class="card settings-card"><h3><i data-lucide="database"></i> Personal data & backups</h3><p class="muted small">Save your tickets, office-pool picks, bankroll history and app preferences.</p><button class="primary backup-button" data-action="settingsExport"><i data-lucide="download"></i> Export my data</button><label for="settingsImport" class="settings-file-label">Import backup JSON</label><input type="file" accept=".json,application/json" id="settingsImport" aria-label="Import backup JSON"><p class="small muted">Import replaces saved data after you confirm. Keep a backup first.</p></section>
<div class="settings-about"><b>NFL Intelligence</b><span>Version 1.3.4</span></div>`}
document.addEventListener('change',e=>{
 const key=e.target.dataset.preference;if(!key)return;
 preferences=validatedPreferences({...preferences,[key]:e.target.type==='checkbox'?e.target.checked:e.target.value});savePreferences();applyPreferences();
 document.querySelector('#timePreview').textContent='Example: '+date('2026-10-18T19:20:00-05:00');
 document.querySelector('#preferenceSaved').textContent='Saved';
});
// Separate modal preserves any open ticket editor underneath it.
let messageQueue=Promise.resolve();
function appMessage(message,{title='Check your entry',kind='warning',confirm=false,confirmText='Continue',copyText=null}={}){
 const task=()=>new Promise(resolve=>{
  const d=document.createElement('dialog');d.className='app-message';d.id='appMessage';d.setAttribute('aria-labelledby','appMessageTitle');d.setAttribute('aria-describedby','appMessageText');
  const symbol={warning:'⚠️',success:'✅',info:'ℹ️'}[kind]||'ℹ️';
  d.innerHTML=`<div class="message-heading"><span class="message-symbol" aria-hidden="true">${symbol}</span><h2 id="appMessageTitle">${esc(title)}</h2></div><p id="appMessageText">${esc(message)}</p>${copyText!==null?`<textarea aria-label="Picks to copy" readonly>${esc(copyText)}</textarea>`:''}<div class="message-actions">${confirm?'<button data-message-cancel>Cancel</button>':''}<button class="primary" data-message-ok>${esc(confirm?confirmText:'Got it')}</button></div>`;
  const hadScrollLock=document.body.classList.contains('sheet-open');document.body.classList.add('sheet-open');
  let accepted=false;d.addEventListener('close',()=>{d.remove();if(!hadScrollLock)document.body.classList.remove('sheet-open');resolve(accepted)},{once:true});
  d.querySelector('[data-message-ok]').onclick=()=>{accepted=true;d.close()};
  d.querySelector('[data-message-cancel]')?.addEventListener('click',()=>d.close());
  document.body.append(d);d.showModal();(d.querySelector('[data-message-cancel]')||d.querySelector('[data-message-ok]')).focus({preventScroll:true});
 });
 const result=messageQueue.then(task);messageQueue=result.catch(()=>{});return result;
}
function appAlert(message){const success=/^(Copied|Weekly review saved)/.test(message);return appMessage(message,{title:success?'Done':'Check your entry',kind:success?'success':'warning'})}
function appConfirm(message){return appMessage(message,{title:'Please confirm',kind:'info',confirm:true,confirmText:/copy anyway/.test(message)?'Copy picks':/Replace/.test(message)?'Import backup':/settlement/.test(message)?'Record settlement':'Record sale'})}
function appCopyFallback(text){return appMessage('Select and copy your picks below.',{title:'Copy your picks',kind:'info',copyText:text})}
