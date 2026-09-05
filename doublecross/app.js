
const D=window.DOUBLE_CROSS_DATA;
const STORE="doubleCrossRavensworthCampaign_v1";
const MAX_THEORIES=3;
const TACTICS={
  intimidate:{name:"INTIMIDATE THE WITNESS",short:"Press the Witness",desc:"Press one discovered suspect statement for a deeper response.",img:"assets/tactics/intimidate.webp"},
  crossed:{name:"CROSSED WIRES",short:"Follow Another Lead",desc:"Identify a genuine contradiction between two discovered facts to recover 1 Investigation Time.",img:"assets/tactics/crossed.webp"},
  tampered:{name:"TAMPERED EVIDENCE",short:"Second Look",desc:"Re-examine one discovered physical clue for free and reveal an additional detail.",img:"assets/tactics/tampered.webp"}
};
const DIFF={
  casual:{name:"Casual Detective",n:3,desc:"All 3 Tactics."},
  detective:{name:"Detective",n:2,desc:"Choose 2 Tactics."},
  master:{name:"Master Detective",n:1,desc:"Choose 1 Tactic."}
};
const app=document.getElementById("app"),modal=document.getElementById("modal"),sheet=document.getElementById("sheet");
let boardCat="suspects";

function freshCase(c){return {configured:false,started:false,view:"setup",ip:c.ip,discovered:[],eliminated:{},notes:[],difficulty:"detective",selected:[],used:{},pressed:{},second:{},seenUnlocks:{},discoveryTimes:{},result:null,unsolved:false,exhaustedNotified:false};}
function fresh(){return {view:"home",currentCase:1,cases:{},solved:[],discoveries:[]};}
let G=fresh();
try{const x=JSON.parse(localStorage.getItem(STORE));if(x)G={...fresh(),...x,cases:x.cases||{}};}catch(e){}
function C(){return D.cases.find(x=>x.id===G.currentCase)||D.cases[0];}
function S(){const c=C();if(!G.cases[c.id])G.cases[c.id]=freshCase(c);const s=G.cases[c.id];if(typeof s.notes==="string")s.notes=s.notes.trim()?[s.notes.trim()]:[];if(!Array.isArray(s.notes))s.notes=[];if(!s.discoveryTimes)s.discoveryTimes={};return s;}
function save(){localStorage.setItem(STORE,JSON.stringify(G));}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function forceTop(){try{window.scrollTo({top:0,left:0,behavior:"instant"});}catch(e){window.scrollTo(0,0)};document.documentElement.scrollTop=0;document.body.scrollTop=0;setTimeout(()=>{window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0},0);}
function openModal(html){sheet.innerHTML=html;modal.classList.add("open");modal.setAttribute("aria-hidden","false");try{sheet.scrollTop=0}catch(e){}}
function closeModal(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true");}
modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});

function navIcon(id){const i={
 home:`<svg viewBox="0 0 24 24"><path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z"/></svg>`,
 board:`<svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>`,
 file:`<svg viewBox="0 0 24 24"><path d="M4 5h6l2 2h8v12H4z"/></svg>`,
 timeline:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l4 2"/></svg>`,
 theory:`<svg viewBox="0 0 24 24"><path d="M12 3v18M6 6h12M7 6 3 13h8L7 6Zm10 0-4 7h8l-4-7Z"/></svg>`};return i[id]}
function header(){const s=S(),c=C();return `<header class="topbar"><button class="brand clickTarget" onclick="goShelf()"><b>DOUBLE CROSS</b><small>${G.view==="home"?"THE RAVENSWORTH CONSPIRACY":esc(c.title.toUpperCase())}</small></button><button class="help clickTarget" onclick="rules()"><i>?</i><em>How to Play</em></button></header>`}
function bottom(){if(G.view==="home"||G.view==="setup")return"";return `<nav class="bottom"><div class="inner">
<button class="nav clickTarget ${G.view==="brief"?"active":""}" onclick="go('brief')">${navIcon("home")}<span>Case Home</span></button>
<button class="nav clickTarget ${G.view==="board"?"active":""}" onclick="go('board')">${navIcon("board")}<span>Case Board</span></button>
<button class="nav clickTarget ${G.view==="notebook"?"active":""}" onclick="go('notebook')">${navIcon("file")}<span>Case File</span></button>
<button class="nav clickTarget ${G.view==="timeline"?"active":""}" onclick="go('timeline')">${navIcon("timeline")}<span>Timeline</span></button>
<button class="nav clickTarget ${G.view==="accuse"?"active":""}" onclick="go('accuse')">${navIcon("theory")}<span>Final Theory</span></button>
</div></nav>`}
function render(){app.innerHTML=`<div class="app">${header()}<main>${view()}</main>${bottom()}</div>`}
function view(){if(G.view==="home")return home();if(G.view==="setup")return setup();if(G.view==="brief")return brief();if(G.view==="board")return board();if(G.view==="notebook")return notebook();if(G.view==="timeline")return timeline();return accuse()}
function go(v){G.view=v;S().view=v;save();render();forceTop()}
function goShelf(){G.view="home";save();render();forceTop()}

function isSolved(id){return G.solved.includes(id)}
function isUnlocked(id){return id===1||G.solved.includes(id-1)||isSolved(id)}
function hasProgress(id){const s=G.cases[id];if(!s)return false;const c=D.cases.find(x=>x.id===id);return !!(s.configured||s.started||s.discovered?.length||s.ip<c.ip||s.result)}
function statusFor(id){if(isSolved(id))return"SOLVED";if(!isUnlocked(id))return"LOCKED";if(hasProgress(id))return"CASE OPEN";return"NEW CASE"}

function home(){
 const disc=G.discoveries.length;
 return `<section class="hero campaignHero"><div class="heroText"><div class="kicker">Double Cross · Solo Mystery Campaign</div><h1>Twelve murders. <span>One buried betrayal.</span></h1><p>${esc(D.campaign.intro)}</p></div></section>
 <section class="campaignPanel">
   <div><div class="kicker">THE RAVENSWORTH DOUBLE CROSS</div><h2>Uncover the conspiracy</h2><p>Each case reveals one piece of a larger mystery surrounding the Ravensworth estate. Solve all 12 cases to uncover the betrayal hidden beneath the murders.</p></div>
   <div class="campaignProgress"><b>${disc}<span>/12</span></b><small>campaign discoveries</small></div>
 </section>
 ${disc?`<div class="discoveryStrip">${G.discoveries.map((d,i)=>`<button class="discoveryMini clickTarget" onclick="showDiscovery(${i})"><span>${String(i+1).padStart(2,"0")}</span><b>${esc(d.title)}</b></button>`).join("")}</div>`:""}
 <div class="sectionHead"><h2>The Murder Case Shelf</h2><small>Cases unlock in order</small></div>
 <div class="shelf campaignShelf">${D.caseSummaries.map(caseCard).join("")}</div>
 ${disc===12?`<button class="primary campaignTruthBtn clickTarget" onclick="showFinalCampaign()">Reveal the Ravensworth Double Cross</button>`:""}`;
}
function caseCard(c){const st=statusFor(c.id),locked=st==="LOCKED",klass=st==="NEW CASE"?"new":st==="SOLVED"?"solved":locked?"locked":"";return `<button class="caseCard clickTarget ${locked?"disabledCase":""}" style="--thumb:url('assets/cases/case-${String(c.id).padStart(2,"0")}.jpg')" onclick="${locked?`lockedCase(${c.id})`:`openCase(${c.id})`}"><div class="caseTop"><span class="caseNumber">${String(c.id).padStart(2,"0")}</span><span class="status ${klass}">${st}</span></div><div class="no">MURDER CASE</div><h3>${esc(c.title)}</h3><p>${esc(c.teaser)}</p><small class="caseBudget">${c.ip} Investigation Time</small></button>`}
function lockedCase(id){toast(`Solve Murder Case ${String(id-1).padStart(2,"0")} to unlock this case.`)}
function openCase(id){G.currentCase=id;const s=S();G.view=!s.configured?"setup":"brief";save();render();forceTop()}
function showDiscovery(i){const d=G.discoveries[i];if(!d)return;openModal(`<div class="modalHeader"><div><div class="kicker">CAMPAIGN DISCOVERY ${String(i+1).padStart(2,"0")}</div><h2>${esc(d.title)}</h2></div><button class="close clickTarget" onclick="closeModal()">Close</button></div><div class="modalBody"><div class="factReveal">${esc(d.text)}</div><div class="factReminder">This is part of the larger Ravensworth mystery. The game does not interpret it for you.</div></div>`)}
function showFinalCampaign(){openModal(`<div class="modalHeader"><div><div class="kicker">THE RAVENSWORTH CONSPIRACY</div><h2>The Double Cross</h2></div><button class="close clickTarget" onclick="closeModal()">Close</button></div><div class="modalBody"><div class="campaignReveal"><p>${esc(D.campaign.finalTruth)}</p><p><b>The first betrayal:</b> Ashford stole from his partners.</p><p><b>The deeper Double Cross:</b> Edmund Ravensworth knowingly sacrificed an innocent man to save the estate.</p></div></div>`)}

function setup(){
 const c=C(),s=S(),need=DIFF[s.difficulty].n;
 return `<section class="caseHome setupScreen"><div class="kicker">Murder Case ${String(c.id).padStart(2,"0")} · Prepare Your Investigation</div><h1>${esc(c.title)}</h1><p class="setupTeaser">${esc(c.teaser)}</p>
 <div class="sectionHead"><h2>Choose Difficulty</h2><small>${need} Tactic${need!==1?"s":""}</small></div>
 <div class="diffGrid">${Object.entries(DIFF).map(([id,d])=>`<button class="choice clickTarget ${s.difficulty===id?"active":""}" onclick="setDiff('${id}')"><b>${d.name}</b><small>${d.desc}</small></button>`).join("")}</div>
 <div class="sectionHead"><h2>Choose Your Tactics</h2><small>${s.selected.length}/${need} selected</small></div>
 <div class="tacticGrid">${Object.entries(TACTICS).map(([id,t])=>`<button class="choice tactic tacticSelect clickTarget ${s.selected.includes(id)?"active":""}" onclick="toggleTactic('${id}')"><div class="tacticArt"><img src="${t.img}" alt=""><span></span></div><div class="body"><b>${t.name}</b><small>${t.short}</small><p>${t.desc}</p></div></button>`).join("")}</div>
 <button class="primary clickTarget" onclick="continueToBrief()">Continue to Case Brief</button><button class="secondary clickTarget" onclick="goShelf()">Exit to Murder Case Shelf</button></section>`;
}
function setDiff(id){const s=S();s.difficulty=id;s.selected=id==="casual"?Object.keys(TACTICS):[];save();render()}
function toggleTactic(id){const s=S();if(s.difficulty==="casual")return;const n=DIFF[s.difficulty].n;if(s.selected.includes(id))s.selected=s.selected.filter(x=>x!==id);else if(s.selected.length<n)s.selected.push(id);else return toast(`Choose only ${n} Tactic${n!==1?"s":""}.`);save();render()}
function continueToBrief(){const s=S(),n=DIFF[s.difficulty].n;if(s.difficulty==="casual")s.selected=Object.keys(TACTICS);if(s.selected.length!==n)return toast(`Choose ${n} Tactic${n!==1?"s":""} before continuing.`);s.configured=true;G.view="brief";save();render();forceTop()}

function tacticCardsReadOnly(){const s=S();return `<div class="briefTactics">${s.selected.map(id=>`<div class="briefTactic"><img src="${TACTICS[id].img}"><div><b>${TACTICS[id].short}</b><small>${TACTICS[id].name}</small><p>${TACTICS[id].desc}</p></div></div>`).join("")}</div>`}
function brief(){
 const c=C(),s=S();
 return `<section class="caseBrief"><div class="kicker">Murder Case ${String(c.id).padStart(2,"0")} · Case Brief</div><h1>${esc(c.title)}</h1><p class="briefStory">${esc(c.briefing)}</p>
 <div class="task objectiveTask"><b>Your objective:</b> ${esc(c.objective)}</div>
 <section class="howInvestigate"><div class="kicker">HOW THIS CASE WORKS</div><h2>Spend your Investigation Time wisely.</h2><p>Start with the Case Brief and the free background on each card. Use deduction to decide which possibilities are worth spending time on. Cross-reference statements, physical evidence and the timeline. New information can unlock follow-up questions.</p><div class="loop">Observe <i>→</i> Hypothesize <i>→</i> Investigate <i>→</i> Deduce <i>→</i> Revise <i>→</i> Solve</div></section>
 <div class="briefRulesGrid">
   <article><span>INVESTIGATION TIME</span><b>${c.ip}</b><p>Investigating a lead costs time. When it reaches zero, you cannot spend more unless a Tactic restores time.</p></article>
   <article><span>FINAL THEORY</span><b>3</b><p>You have exactly three attempts to identify the killer, weapon and true murder location.</p></article>
   <article><span>POSSIBILITIES</span><b>${c.suspects.length+c.weapons.length+c.locations.length}</b><p>${c.suspects.length} suspects, ${c.weapons.length} weapons and ${c.locations.length} locations could fit the crime. You will not have enough Investigation Time to examine everything.</p></article>
 </div>
 <div class="sectionHead"><div><h2>Your Tactics</h2><p class="sectionDescription">Special investigative moves you can use during this case. Each selected Tactic can be used once.</p></div></div>${tacticCardsReadOnly()}
 <button class="primary clickTarget" onclick="${s.started?"go('board')":"beginInvestigation()"}">${s.started?"Resume Investigation":"Begin Investigation"}</button>
 <button class="secondary clickTarget" onclick="goShelf()">Exit to Murder Case Shelf</button>
 ${hasProgress(c.id)?`<button class="danger clickTarget" onclick="confirmReset()">Reset This Case</button>`:""}</section>`;
}
function beginInvestigation(){const s=S();s.started=true;s.view="board";G.view="board";save();render();forceTop()}
function confirmReset(){const c=C();openModal(`<div class="modalHeader dangerHeader"><div><div class="kicker">RESET CASE</div><h2>Start over?</h2><p>This cannot be undone.</p></div><button class="close clickTarget" onclick="closeModal()">Cancel</button></div><div class="modalBody"><div class="warningPanel"><b>Reset Murder Case ${String(c.id).padStart(2,"0")}</b><p>This erases this case's evidence, eliminations, notes, Tactics, Investigation Time and Final Theory attempts. Campaign progress from later solved cases will also be removed.</p></div><div class="modalActions"><button class="secondary clickTarget" onclick="closeModal()">Keep My Progress</button><button class="danger clickTarget" onclick="resetCase()">Reset Case</button></div></div>`)}
function resetCase(){const id=C().id;G.cases[id]=freshCase(C());G.solved=G.solved.filter(x=>x<id);G.discoveries=G.discoveries.filter(d=>d.caseId<id);for(const k of Object.keys(G.cases)){if(Number(k)>id)delete G.cases[k]}G.view="setup";save();closeModal();render();forceTop()}

function meter(compact=false){const c=C(),s=S(),level=s.ip<=3?"red":s.ip<=6?"amber":s.ip<=9?"gold":"green";let seg="";for(let i=0;i<c.ip;i++)seg+=`<i class="seg ${i<s.ip?"on":""}"></i>`;return `<div class="meter ${level} ${compact?"compact":""}"><div class="meterHead"><b>Investigation Time</b><span>${s.ip} / ${c.ip}</span></div><div class="segments">${seg}</div></div>`}
function tacticBar(){const s=S();if(!s.selected.length)return"";return `<div class="activeTactics">${s.selected.map(id=>`<button class="tacticChip clickTarget ${s.used[id]?"used":""}" onclick="useTactic('${id}')"><img src="${TACTICS[id].img}"><span><b>${TACTICS[id].short}${s.used[id]?" · USED":""}</b><small>${TACTICS[id].name}</small></span></button>`).join("")}</div>`}
function workspaceSticky(extra=""){return `<div class="workspaceSticky">${meter(true)}${tacticBar()}${extra}</div>`}
function cardData(cat){return C()[cat]}
function setBoard(cat){boardCat=cat;render();forceTop()}
function board(){
 const c=C(),s=S();const tabs=`<div class="tabs boardTabs">${["suspects","weapons","locations"].map(cat=>`<button class="tab clickTarget ${boardCat===cat?"active":""}" onclick="setBoard('${cat}')">${cat[0].toUpperCase()+cat.slice(1)} · 6</button>`).join("")}</div>`;
 return `<div class="sectionHead boardHead"><div><div class="kicker">Six possibilities in each category</div><h2>Case Board</h2></div><small>Review cards freely. Investigation costs time.</small></div>${workspaceSticky(tabs)}<div class="cardGrid">${cardData(boardCat).map(c=>boardCard(c,boardCat)).join("")}</div>`;
}
function unseenUnlockedForCard(cardId){const c=C(),s=S();return c.actions.filter(a=>a.card===cardId&&a.requires&&s.discovered.includes(a.requires)&&!s.discovered.includes(a.id)&&!s.seenUnlocks[a.id])}
function boardCard(c,cat){
 const s=S();
 return `<button class="card portraitCard clickTarget ${s.eliminated[c.id]?"elim":""}" onclick="openCard('${c.id}','${cat}')">
   <div class="portraitFrame"><img src="${c.src}" alt="${esc(c.name)}"></div>
   <div class="mobileCardLabel"><b>${esc(c.name)}</b>${c.subtitle?`<small>${esc(c.subtitle)}</small>`:""}</div>
   ${unseenUnlockedForCard(c.id).length?`<span class="questionBadge">NEW QUESTION</span>`:""}
 </button>`;
}
function visibleActions(cardId){const c=C(),s=S();return c.actions.filter(a=>a.card===cardId&&!s.discovered.includes(a.id)&&(!a.requires||s.discovered.includes(a.requires)))}
function markSeen(cardId){const s=S();unseenUnlockedForCard(cardId).forEach(a=>s.seenUnlocks[a.id]=true);save()}
function openCard(id,cat){
 const c=C(),s=S(),card=cardData(cat).find(x=>x.id===id);
 if(!card)return toast("Card unavailable.");
 markSeen(id);
 const acts=c.actions.filter(a=>a.card===id);
 const available=visibleActions(id);
 const disc=acts.filter(a=>s.discovered.includes(a.id));
 const caseContext=c.backgrounds[id]||"No additional case-specific information is available.";
 const profile=card.description||"Review this possibility freely before deciding whether it is worth spending Investigation Time.";
 openModal(`<div class="compactIdentity cardDrawerIdentity">
   ${artCardImage(card,"drawerThumb artOnlyThumb")}
   <div class="drawerIdentityText"><div class="kicker">${cat.slice(0,-1).toUpperCase()}</div><h2>${esc(card.name)}</h2>${card.subtitle?`<p>${esc(card.subtitle)}</p>`:""}</div>
   <button class="close clickTarget" onclick="closeModal()">Close</button>
 </div>
 <div class="modalBody drawerBody cardDrawerBody">
   <section class="drawerSection first">
     <div class="drawerLabel">BACKGROUND</div>
     <p>${esc(profile)}</p>
   </section>
   <section class="drawerSection">
     <h3>What You Know</h3>
     <p>${esc(caseContext)}</p>
   </section>
   <section class="drawerStatus">
     <div><span class="drawerLabel">STATUS</span><b>${s.eliminated[id]?"Eliminated":"Still Open"}</b><small>${s.eliminated[id]?"Removed from your current theory.":"Still possible in your current theory."}</small></div>
     <button class="secondary inlineBtn clickTarget" onclick="toggleElim('${id}')">${s.eliminated[id]?"Restore to Theory":"Mark Eliminated"}</button>
   </section>
   <section class="drawerSection">
     <div class="drawerSectionHead"><h3>Investigate</h3><span class="countPill">${available.length} ${available.length===1?"lead":"leads"} available</span></div>
     <div class="actions">${available.length?available.map(actionHTML).join(""):`<div class="emptyState">No available investigations on this card right now.</div>`}</div>
   </section>
   <section class="drawerSection">
     <div class="drawerSectionHead"><h3>Discovered Facts</h3><span class="countPill">${disc.length} ${disc.length===1?"fact":"facts"}</span></div>
     ${disc.length?disc.map(a=>`<article class="miniFact"><span class="tag">${a.tag}</span><b>${esc(a.clueTitle)}</b><p>${esc(a.text)}</p></article>`).join(""):`<div class="emptyState">No facts discovered about this card yet.</div>`}
   </section>
 </div>`);
}
function toggleElim(id){const s=S();s.eliminated[id]=!s.eliminated[id];save();closeModal();render()}
function actionHTML(a){const s=S(),afford=s.ip>=a.cost&&!s.unsolved;return `<button class="action clickTarget ${!afford?"disabled":""}" ${afford?`onclick="doAction('${a.id}')"`:"disabled"}><div class="copy"><b>${esc(a.label)}</b><small>${s.unsolved?"Case is unsolved — reset to try again.":s.ip<a.cost?"No Investigation Time remaining":"Tap to investigate"}</small></div><span class="cost">Cost ${a.cost}</span></button>`}
function unlockedActions(trigger){const c=C(),s=S();return c.actions.filter(a=>a.requires===trigger&&!s.discovered.includes(a.id))}
function doAction(id){
 const c=C(),s=S(),a=c.actions.find(x=>x.id===id);if(!a||s.discovered.includes(id)||s.ip<a.cost||s.unsolved)return;s.ip-=a.cost;s.discovered.push(id);const unlocked=unlockedActions(id);save();
 openModal(`<div class="modalHeader"><div><div class="kicker">${a.tag}</div><h2>${esc(a.clueTitle)}</h2><p>New fact added to your Case File.</p></div><button class="close clickTarget" onclick="closeFactResult()">Close</button></div><div class="modalBody"><div class="factReveal">${esc(a.text)}</div><div class="factReminder">This is a fact or statement, not a conclusion. Decide what it changes in your theory.</div>${unlocked.length?`<div class="unlockPanel"><div class="unlockSymbol">↗</div><div><span>NEW LINE OF QUESTIONING</span><b>${unlocked.length===1?esc(unlocked[0].label):`${unlocked.length} new leads unlocked`}</b><p>Return to the Case Board. A new question is now visible only because this discovery opened it.</p></div></div>`:""}</div>`);
}
function closeFactResult(){closeModal();render();const s=S();if(s.ip===0&&!s.exhaustedNotified){s.exhaustedNotified=true;save();setTimeout(exhaustedDrawer,0)}}
function exhaustedDrawer(){openModal(`<div class="modalHeader warningModalHeader"><div class="warningTitle"><span class="warningIcon">⚠</span><div><div class="kicker">INVESTIGATION TIME EXHAUSTED</div><h2>No paid investigation remains.</h2></div></div><button class="close clickTarget" onclick="closeModal()">Close</button></div><div class="modalBody"><div class="infoPanel"><p>You can still review the Case Board, Case File and Timeline, use any available Tactic, and submit your Final Theory. If Follow Another Lead restores time, you may investigate again.</p></div></div>`)}

function notebook(){
 const c=C(),s=S(),clues=s.discovered.map(id=>c.actions.find(a=>a.id===id)).filter(Boolean);
 const tags=[...new Set(clues.map(x=>x.tag))];
 return `<div class="sectionHead"><div><div class="kicker">Facts, not conclusions</div><h2>Case File</h2></div><small>${clues.length} facts discovered</small></div>${workspaceSticky()}
 <div class="caseFileGroups">${tags.map(tag=>`<section class="fileGroup"><div class="fileGroupHead"><h3>${tag}</h3><small>${clues.filter(x=>x.tag===tag).length}</small></div>${clues.filter(x=>x.tag===tag).map(x=>`<article class="clue compactClue"><span class="tag">${x.tag}</span><h3>${esc(x.clueTitle)}</h3><p>${esc(x.text)}</p></article>`).join("")}</section>`).join("")||`<div class="emptyState">No facts discovered yet.</div>`}</div>
 ${Object.keys(s.pressed).filter(k=>s.pressed[k]).map(id=>`<article class="clue compactClue"><span class="tag">FOLLOW-UP</span><h3>Pressed Witness</h3><p>${esc(c.press[id])}</p></article>`).join("")}
 ${Object.keys(s.second).filter(k=>s.second[k]).map(id=>`<article class="clue compactClue"><span class="tag">SECOND LOOK</span><h3>Additional Detail</h3><p>${esc(c.second[id])}</p></article>`).join("")}
 <div class="sectionHead notesHead"><div><h2>Detective Notes</h2><p class="sectionDescription">Add short notes as you form and revise your theory.</p></div><small>Saved on this device</small></div>
 <div class="notesComposer"><textarea id="newNote" class="notes" placeholder="Add a deduction, contradiction, or question…"></textarea><button class="secondary clickTarget" onclick="addNote()">Add Note</button></div>
 <div class="noteList">${s.notes.length?s.notes.slice().reverse().map((n,i)=>{const real=s.notes.length-1-i;return `<article class="noteItem"><p>${esc(n)}</p><button class="noteDelete clickTarget" onclick="deleteNote(${real})">Delete</button></article>`}).join(""):`<div class="emptyState">No detective notes yet.</div>`}</div>`;
}
function saveNotes(){addNote()}


function addNote(){
 const el=document.getElementById("newNote"),v=(el?.value||"").trim();
 if(!v)return toast("Write a note first.");
 S().notes.push(v);save();render();forceTop();
}
function deleteNote(i){S().notes.splice(i,1);save();render();forceTop()}
function timeline(){
 const c=C(),s=S(),entries=[];
 for(const id of s.discovered){
   if(c.timeline[id]){
     entries.push({...c.timeline[id],source:c.actions.find(a=>a.id===id)?.clueTitle||"Discovered Fact",id});
   }
 }
 if(c.timeline.discovery){
   entries.push({...c.timeline.discovery,source:"Body Discovered",id:"body"});
 }else{
   entries.push({time:"",text:`${c.victim} is discovered dead.`,source:"Body Discovered",id:"body"});
 }
 const parse=t=>{
   const m=(t||"").match(/(\d+):(\d+)\s*(AM|PM)/i);
   if(!m)return 99999;
   let h=Number(m[1])%12+(m[3].toUpperCase()==="PM"?12:0), mins=h*60+Number(m[2]);
   if(m[3].toUpperCase()==="AM" && h<6) mins+=1440;
   return mins;
 };
 entries.sort((a,b)=>parse(a.time)-parse(b.time));
 const newestDiscovered=[...s.discovered].reverse().find(id=>c.timeline[id]);
 const pulseId=newestDiscovered||"body";
 return `<div class="sectionHead"><div><div class="kicker">What happened when</div><h2>Timeline</h2></div><small>Discovered facts only</small></div>${workspaceSticky()}
 <div class="timelineIntro">The timeline organizes facts you have uncovered. It does not tell you which statements are true.</div>
 <div class="timeline">${entries.map(e=>`<article class="timeRow"><div class="time">${esc(e.time||"Time unknown")}</div><div class="timelineMarker ${e.id===pulseId?"pulse":""}"><span></span></div><div class="timeFact"><span class="timeSource">${esc(e.source)}</span><p>${esc(e.text)}</p></div></article>`).join("")}</div>`;
}

function optionDrawer(kicker,title,subtitle,rows){openModal(`<div class="modalHeader tacticModalHeader"><div><div class="kicker">${esc(kicker)}</div><h2>${esc(title)}</h2>${subtitle?`<p>${esc(subtitle)}</p>`:""}</div><button class="close clickTarget" onclick="closeModal()">Close</button></div><div class="modalBody tacticModalBody"><div class="drawerOptionList">${rows}</div></div>`)}
function detailDrawer(kicker,title,text,reminder=""){openModal(`<div class="modalHeader tacticModalHeader"><div><div class="kicker">${esc(kicker)}</div><h2>${esc(title)}</h2></div><button class="close clickTarget" onclick="closeModal();render()">Close</button></div><div class="modalBody"><div class="factReveal">${esc(text)}</div>${reminder?`<div class="factReminder">${esc(reminder)}</div>`:""}</div>`)}
function useTactic(id){const s=S();if(s.used[id])return toast(`${TACTICS[id].short} has already been used.`);if(id==="intimidate")return press();if(id==="tampered")return secondLook();return crossed()}
function press(){const c=C(),s=S(),ids=s.discovered.filter(id=>c.press[id]&&!s.pressed[id]);if(!ids.length)return warning("Press the Witness becomes available after you uncover a suspect statement.","Review the requirement, then try again.");const rows=ids.map(id=>{const a=c.actions.find(x=>x.id===id);return `<button class="drawerOption clickTarget" onclick="resolvePress('${id}')"><span class="drawerOptionText"><b>${esc(a.clueTitle)}</b><small>${esc(a.label)}</small></span><span class="drawerChevron">›</span></button>`}).join("");optionDrawer("PRESS THE WITNESS","Who do you challenge?","Choose one discovered suspect statement.",rows)}
function resolvePress(id){const c=C(),s=S();s.used.intimidate=true;s.pressed[id]=true;save();detailDrawer("FOLLOW-UP","Pressed Statement",c.press[id],"A changed statement is still testimony, not proof.")}
function secondLook(){const c=C(),s=S(),ids=s.discovered.filter(id=>c.second[id]&&!s.second[id]);if(!ids.length)return warning("Second Look becomes available after you examine physical evidence.","Review the requirement, then try again.");const rows=ids.map(id=>{const a=c.actions.find(x=>x.id===id);return `<button class="drawerOption clickTarget" onclick="resolveSecond('${id}')"><span class="drawerOptionText"><b>${esc(a.clueTitle)}</b><small>Free deeper examination</small></span><span class="drawerChevron">›</span></button>`}).join("");optionDrawer("SECOND LOOK","Re-examine which evidence?","Choose one discovered physical clue.",rows)}
function resolveSecond(id){const c=C(),s=S();s.used.tampered=true;s.second[id]=true;save();detailDrawer("SECOND LOOK","Additional Detail",c.second[id])}
function crossed(){const c=C(),s=S();if(s.discovered.length<2)return warning("Follow Another Lead needs at least two discovered facts.","Discover more evidence, then compare two facts you believe contradict each other.");const rows=s.discovered.map(id=>{const a=c.actions.find(x=>x.id===id);return `<button class="drawerOption clickTarget" onclick="pickSecond('${id}')"><span class="drawerOptionText"><b>${esc(a.clueTitle)}</b><small>${a.tag}</small></span><span class="drawerChevron">›</span></button>`}).join("");optionDrawer("FOLLOW ANOTHER LEAD","Select the first fact","Choose the first half of a possible contradiction.",rows)}
function pickSecond(first){const c=C(),s=S(),rows=s.discovered.filter(id=>id!==first).map(id=>{const a=c.actions.find(x=>x.id===id);return `<button class="drawerOption clickTarget" onclick="resolveContra('${first}','${id}')"><span class="drawerOptionText"><b>${esc(a.clueTitle)}</b><small>${a.tag}</small></span><span class="drawerChevron">›</span></button>`}).join("");optionDrawer("FOLLOW ANOTHER LEAD","Select the conflicting fact","Choose the fact you believe contradicts the first.",rows)}
function resolveContra(a,b){const c=C(),s=S(),ok=c.contradictions.some(p=>p.includes(a)&&p.includes(b));if(ok){s.used.crossed=true;s.ip=Math.min(c.ip,s.ip+1);save();detailDrawer("CONTRADICTION CONFIRMED","+1 Investigation Time","Those two discovered facts cannot both be true as stated.")}else detailDrawer("NO DIRECT CONTRADICTION","Keep working the case","Those facts may both be true. Follow Another Lead was not consumed.")}
function warning(title,body){
 openModal(`<div class="modalHeader warningModalHeader">
   <div class="warningTitle"><span class="warningIcon">⚠</span><div><div class="kicker">TACTIC UNAVAILABLE</div><h2>${esc(title)}</h2></div></div>
   <button class="close clickTarget" onclick="closeModal()">Close</button>
 </div>
 <div class="modalBody"><div class="infoPanel"><p>${esc(body)}</p></div></div>`);
}

function opts(arr,selected=""){return `<option value="">Choose…</option>${arr.map(x=>`<option value="${x.id}" ${x.id===selected?"selected":""}>${esc(x.name)}</option>`).join("")}`}

function artCardImage(card,extraClass=""){
 return `<div class="artCrop ${extraClass}"><img src="${card.src}" alt="${esc(card.name)}"></div>`;
}

function theoryPreview(cat,id){
 if(!id)return "";
 const card=cardData(cat).find(x=>x.id===id);
 if(!card)return "";
 const label=cat==="suspects"?"SUSPECT":cat==="weapons"?"WEAPON":"LOCATION";
 return `<article class="theoryCardUnified">
   <div class="theoryCategory">${label}</div>
   ${artCardImage(card,"theoryArt")}
   <div class="theoryCardLabel">
     <b>${esc(card.name)}</b>
     ${card.subtitle?`<small>${esc(card.subtitle)}</small>`:""}
   </div>
 </article>`;
}
function updateTheoryPreview(){const s=S(),a=document.getElementById("as"),w=document.getElementById("aw"),l=document.getElementById("al");if(!a)return;const p=document.getElementById("theoryPreview");p.innerHTML=theoryPreview("suspects",a.value)+theoryPreview("weapons",w.value)+theoryPreview("locations",l.value)}
function accuse(){
 const c=C(),s=S(),last=s.result||{},remaining=MAX_THEORIES-(last.incorrectAttempts||0);
 if(s.unsolved)return `<div class="sectionHead"><div><div class="kicker">Case Status</div><h2>Case Unsolved</h2></div></div>${workspaceSticky()}<section class="accuseCard"><div class="unsolvedPanel"><h3>All 3 Final Theory attempts were used.</h3><p>The solution remains hidden. Reset this case to investigate again from the beginning.</p><button class="danger clickTarget" onclick="confirmReset()">Reset Case</button></div></section>`;
 return `<div class="sectionHead theoryPageHead"><div><div class="kicker">When you are ready</div><h2>Final Theory</h2></div></div>${workspaceSticky()}
 <section class="accuseCard">
 <div class="theoryAttemptsInline"><div><span>THEORY ATTEMPTS</span><b>${remaining} remaining</b></div><div class="attemptDotsInline">${Array.from({length:3},(_,i)=>`<i class="${i<remaining?"on":""}"></i>`).join("")}</div></div>
 <div class="theorySection"><p class="accuseIntro">${s.ip===0?"Investigation Time is exhausted. Review what you know and make your best deduction.":"Choose your suspect, weapon and location. Your selections remain saved if the theory is wrong."}</p>
 <div class="formGrid"><label class="field"><span>WHO DID IT?</span><select id="as" onchange="updateTheoryPreview()">${opts(c.suspects,last.suspect||"")}</select></label><label class="field"><span>WHAT WAS USED?</span><select id="aw" onchange="updateTheoryPreview()">${opts(c.weapons,last.weapon||"")}</select></label><label class="field full"><span>WHERE DID THE KILLING OCCUR?</span><select id="al" onchange="updateTheoryPreview()">${opts(c.locations,last.location||"")}</select></label></div>
 <div id="theoryPreview" class="theoryPreview">${theoryPreview("suspects",last.suspect)}${theoryPreview("weapons",last.weapon)}${theoryPreview("locations",last.location)}</div></div>
 <button class="primary clickTarget" onclick="submitFromTheoryPage()">Submit Final Theory</button>${solvedHTML()}</section>`;
}
function confirmTheory(){submitFromTheoryPage()}

function submitFromTheoryPage(){
 const a=document.getElementById("as").value,w=document.getElementById("aw").value,l=document.getElementById("al").value;
 if(!a||!w||!l)return toast("Choose a suspect, weapon and location.");
 openModal(`<div class="modalHeader compactTheoryConfirm">
   <div><div class="kicker">FINAL THEORY</div><h2>Submit this theory?</h2><p>An incorrect theory will use 1 of your 3 attempts.</p></div>
   <button class="close clickTarget" onclick="closeModal()">Keep Reviewing</button>
 </div>
 <div class="modalBody"><div class="theoryConfirmVisual">${theoryPreview("suspects",a)}${theoryPreview("weapons",w)}${theoryPreview("locations",l)}</div>
 <button class="primary clickTarget" onclick="submitTheory('${a}','${w}','${l}')">Submit Theory</button></div>`);
}
function submitTheory(a,w,l){const c=C(),s=S(),core=(a===c.solution.suspect)+(w===c.solution.weapon)+(l===c.solution.location),bad=s.result?.incorrectAttempts||0;s.result={suspect:a,weapon:w,location:l,core,solved:core===3,incorrectAttempts:bad+(core===3?0:1)};closeModal();if(core===3){solveCase()}else if(s.result.incorrectAttempts>=MAX_THEORIES){s.unsolved=true;save();render();setTimeout(()=>warning("CASE UNSOLVED","All 3 Final Theory attempts have been used. The solution remains hidden. Reset the case to try again."),0)}else{save();render();setTimeout(()=>theoryFailure(core),0)}}
function theoryFailure(core){const left=MAX_THEORIES-S().result.incorrectAttempts;openModal(`<div class="modalHeader theoryFailHeader"><div><div class="kicker">THE THEORY DOESN'T HOLD</div><h2>${core} of 3 deductions are correct.</h2><p>The case will not identify which deduction is wrong.</p></div><button class="close clickTarget" onclick="closeModal()">Close</button></div><div class="modalBody"><div class="failureMessage">Your three selections remain saved on the Final Theory screen. Revise only what you want to reconsider.</div><div class="attemptFeedback"><b>${left}</b><span>theory attempt${left===1?"":"s"} remaining</span></div><div class="modalActions"><button class="secondary clickTarget" onclick="closeModal()">Revise Theory</button><button class="primary clickTarget" onclick="closeModal();go('board')">Continue Investigating</button></div></div>`)}
function solveCase(){const c=C(),s=S();if(!G.solved.includes(c.id))G.solved.push(c.id);if(!G.discoveries.some(d=>d.caseId===c.id))G.discoveries.push({caseId:c.id,...c.discovery});G.solved.sort((a,b)=>a-b);G.discoveries.sort((a,b)=>a.caseId-b.caseId);save();render();forceTop()}
function rating(){const c=C(),s=S(),attempts=(s.result?.incorrectAttempts||0)+1;if(attempts===1&&s.ip>=Math.ceil(c.ip*.2))return"MASTERFUL";if(attempts<=2&&s.ip>0)return"SHARP";return"CASE CLOSED"}
function solvedHTML(){const c=C(),s=S();if(!s.result?.solved)return"";const suspect=c.suspects.find(x=>x.id===c.solution.suspect),weapon=c.weapons.find(x=>x.id===c.solution.weapon),loc=c.locations.find(x=>x.id===c.solution.location);const crit=c.critical.filter(id=>s.discovered.includes(id)).length,tactics=Object.keys(s.used).filter(k=>s.used[k]).length,attempts=(s.result.incorrectAttempts||0)+1;return `<article class="caseSolved"><div class="solvedBanner"><span>CASE SOLVED</span><h2>${esc(c.title)}</h2><p><b>${esc(suspect.name)}</b> · <b>${esc(weapon.name)}</b> · <b>${esc(loc.name)}</b></p></div><div class="solveStats"><div><b>${s.ip} / ${c.ip}</b><small>Investigation Time remaining</small></div><div><b>${s.discovered.length}</b><small>Facts uncovered</small></div><div><b>${crit} / ${c.critical.length}</b><small>Critical evidence found</small></div><div><b>${attempts} / 3</b><small>Theory attempts used</small></div><div><b>${tactics}</b><small>Tactics used</small></div><div><b>${rating()}</b><small>Case rating</small></div></div><div class="reconstructionInline"><div class="kicker">CASE RECONSTRUCTION</div><h3>What really happened</h3><p>${esc(c.reconstruction)}</p><div class="campaignDiscovery"><span>CAMPAIGN DISCOVERY ${String(c.id).padStart(2,"0")} / 12</span><h3>${esc(c.discovery.title)}</h3><p>${esc(c.discovery.text)}</p></div>${c.id<12?`<button class="primary clickTarget" onclick="nextCase()">Continue to Murder Case ${String(c.id+1).padStart(2,"0")}</button>`:`<button class="primary clickTarget" onclick="goShelf()">Return to the Murder Case Shelf</button>`}</div></article>`}
function nextCase(){const id=C().id+1;G.currentCase=id;G.view="setup";save();render();forceTop()}

function rules(){openModal(`<div class="modalHeader"><div><div class="kicker">DOUBLE CROSS</div><h2>How to Play</h2><p>${esc(D.campaign.tagline)}</p></div><button class="close clickTarget" onclick="closeModal()">Close</button></div><div class="modalBody helpBody">
<section class="helpStep"><span>1</span><div><h3>Prepare the case</h3><p>Select a difficulty and your limited Tactics. Then read the Case Brief before entering the Case Board.</p></div></section>
<section class="helpStep"><span>2</span><div><h3>How to investigate</h3><p>The six suspects, six weapons and six locations are possibilities, not a checklist. Review card background freely, then spend Investigation Time only on leads that can test your theory.</p></div></section>
<section class="helpStep"><span>3</span><div><h3>Investigation Time</h3><p>Each case has its own time budget. Most investigations cost 1; deeper forensic work can cost 2. At zero you may still review evidence, use available Tactics, and accuse.</p></div></section>
<section class="helpStep"><span>4</span><div><h3>Tactics</h3><p>Press the Witness reveals a deeper response. Follow Another Lead rewards a genuine contradiction with +1 Investigation Time. Second Look re-examines physical evidence for free. Each selected Tactic can be used once.</p></div></section>
<section class="helpStep"><span>5</span><div><h3>Final Theory</h3><p>You have exactly <b>3 attempts</b> to identify Who + What + Where. A wrong theory tells you only how many of the three are correct, never which ones.</p></div></section>
<section class="helpStep"><span>6</span><div><h3>The larger Double Cross</h3><p>Every solved murder unlocks one Campaign Discovery. Cases unlock in order. The discoveries eventually expose the betrayal connecting Ravensworth's history.</p></div></section>
</div>`)}
function toast(t){openModal(`<div class="modalHeader compactModal"><div><h2>${esc(t)}</h2></div><button class="close clickTarget" onclick="closeModal()">Close</button></div>`)}
render();
