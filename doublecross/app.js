
const D = window.DOUBLE_CROSS_DATA;
const C = D.case1;
const ACTIONS = D.actions;
const STORE = "doubleCrossSolo_case1v2_v20";

const TACTICS = {
  intimidate: {
    name: "INTIMIDATE THE WITNESS",
    short: "Press the Witness",
    desc: "Press a witness for a deeper response without spending Investigation Time.",
    img: "assets/tactics/intimidate.webp"
  },
  crossed: {
    name: "CROSSED WIRES",
    short: "Follow Another Lead",
    desc: "Identify a genuine contradiction to recover 1 Investigation Time.",
    img: "assets/tactics/crossed.webp"
  },
  tampered: {
    name: "TAMPERED EVIDENCE",
    short: "Second Look",
    desc: "Re-examine physical evidence for free and reveal an additional detail.",
    img: "assets/tactics/tampered.webp"
  }
};

const DIFF = {
  casual: {name:"Casual Detective", n:3, desc:"More tools to help crack the case."},
  detective: {name:"Detective", n:2, desc:"A balanced test of deduction."},
  master: {name:"Master Detective", n:1, desc:"For seasoned investigators only."}
};

const BACKGROUND = {
  "evelyn": "The Ravensworth family's physician. Crowe privately asked her earlier that evening whether an old shoulder injury could explain a set of unusual drag marks he had photographed.",
  "sebastian": "The family solicitor. Crowe requested access to insurance inventories and recent claims, which Cole considered an intrusion into privileged estate business.",
  "alistair": "Lord Ravensworth's business partner. Several missing antiques had been purchased through companies connected to Finch, giving Crowe reason to question him.",
  "harriet": "The manor's housekeeper. She resented Crowe's habit of questioning junior staff without permission and knew more than anyone about the household's movements.",
  "jasper": "The Ravensworth chauffeur. He controls the motorcar keys, regularly travels between the manor and railway station, and knows the service road to the lake better than anyone.",
  "lucian": "Lord Ravensworth's estranged son. Recently returned from sea, he had argued with Crowe after the investigator asked about debts accumulated abroad.",
  "letteropener": "An antique silver letter opener normally kept with the manor correspondence. Its pointed blade makes it an obvious but perhaps too obvious suspect.",
  "decanter": "A heavy cut-crystal whisky decanter set out in the drawing room before the storm.",
  "pistol": "An ornate dueling pistol from the Ravensworth collection. It was displayed in the Library earlier that evening.",
  "firepoker": "A heavy wrought-iron poker from the Boathouse stove. Its blackened end is normally coated with soot and lake-house ash.",
  "fountainpen": "A black-and-gold fountain pen Crowe used while taking notes during interviews.",
  "rifle": "A vintage hunting rifle kept in a locked sporting cabinet near the rear hall.",
  "library": "Crowe used the Library as a temporary interview room. Several members of the household were seen entering and leaving it during the evening.",
  "winecellar": "A cool cellar beneath the manor. One rack contains an empty space where an expensive 1898 vintage should have been.",
  "study": "Lord Ravensworth gave Crowe access to estate inventories here before dinner. A desk drawer was later found open.",
  "rosegarden": "Crowe's body was discovered here at 12:20 a.m. Rain had begun shortly before midnight, washing much of the gravel path clean.",
  "boathouse": "A lakeside building with a small iron stove, storage lockers, rowboats, and direct access to the service road. It is normally locked after dusk.",
  "masterbedroom": "Lord Ravensworth's private room. Crowe had no official reason to enter it, though a maid reported its corridor door standing open during the storm."
};

const PRESS = {
  "evelyn_body": "Pressed, Dr. Marsh says the wound shape is especially important: a rounded bottle or flat stone would leave a broader injury. The object had a narrow curved striking surface.",
  "sebastian_reason": "Cole reluctantly admits Crowe suspected an organized theft rather than simple household pilfering. The missing pieces were small enough to conceal in crates and valuable enough to justify foreign resale.",
  "alistair_business": "Finch admits he once introduced Jasper to the Calais dealer after Jasper asked where an old motorcar badge could be sold. He says he thought nothing of it at the time.",
  "harriet_staff": "Mrs. Bloom recalls hearing the motorcar engine briefly at about 11:45 p.m., despite Jasper later saying he spent the entire period repairing it in the shed.",
  "jasper_alibi": "Pressed on the repair, Jasper cannot name which terminal was loose. He changes the subject and says the storm made the engine noises difficult to distinguish.",
  "lucian_debt": "Vale admits he lied about being alone in the Billiard Room. He was with his father discussing the debt until 11:18 p.m., which he concealed out of embarrassment."
};

const SECOND = {
  "opener_lab": "The dark stain near the tip is old sealing wax, not blood.",
  "decanter_lab": "Only ordinary whisky residue is present around the stopper.",
  "pistol_lab": "The mechanism carries an unbroken film of dust inside the lock.",
  "poker_lab": "A second swab finds a thread of dark green wool caught near the handle, matching the chauffeur's work coat.",
  "pen_lab": "Crowe's last visible note ends mid-sentence: 'If J.W. denies the lake—'",
  "rifle_lab": "The cabinet seal predates the murder and could not have been replaced without visible damage."
};

const CONTRA = [
  [
    "jasper_alibi",
    "harriet_staff"
  ],
  [
    "jasper_alibi",
    "boathouse_tracks"
  ],
  [
    "jasper_mud",
    "jasper_alibi"
  ],
  [
    "lucian_debt",
    "bedroom_search"
  ]
];

const TIMELINE = {
  "harriet_staff": {
    "time": "9:30 PM",
    "text": "Crowe tells Mrs. Bloom he believes someone is using the lake as a back door."
  },
  "lucian_debt": {
    "time": "10:40 PM",
    "text": "Vale says his argument with Crowe ended around this time."
  },
  "bedroom_search": {
    "time": "11:18 PM",
    "text": "Lord Ravensworth and Vale are seen together at the end of their private meeting."
  },
  "jasper_alibi": {
    "time": "11:35 PM",
    "text": "Jasper claims he began repairing the motorcar in the shed."
  },
  "evelyn_body": {
    "time": "11:50–12:10 AM",
    "text": "Dr. Marsh places Crowe's death within this window."
  },
  "discovery": {
    "time": "12:20 AM",
    "text": "Crowe's body is discovered in the Rose Garden."
  }
};

function fresh(){
  return {
    started:false, configured:false, view:"home", ip:C.ip,
    discovered:[], eliminated:{}, notes:"", result:null,
    difficulty:"detective", selected:[], used:{}, pressed:{}, second:{}, seenUnlocks:{}
  };
}
let S = fresh();
try{
  const saved = JSON.parse(localStorage.getItem(STORE));
  if(saved) S = {...fresh(), ...saved};
}catch(e){}

const app = document.getElementById("app");
const modal = document.getElementById("modal");
const sheet = document.getElementById("sheet");

function save(){localStorage.setItem(STORE, JSON.stringify(S));}
function forceTop(){
  try{window.scrollTo(0,0);}catch(e){}
  try{document.documentElement.scrollTop=0;}catch(e){}
  try{document.body.scrollTop=0;}catch(e){}
  setTimeout(()=>{
    try{window.scrollTo(0,0);}catch(e){}
    try{document.documentElement.scrollTop=0;}catch(e){}
    try{document.body.scrollTop=0;}catch(e){}
  },0);
}
function hasProgress(){return !!(S.started || S.configured || S.discovered.length || S.ip < C.ip || S.result || Object.keys(S.used||{}).length);}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function openModal(html){sheet.innerHTML=html;modal.classList.add("open");modal.setAttribute("aria-hidden","false");}
function closeModal(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true");}
modal.addEventListener("click",e=>{if(e.target===modal) closeModal();});

function navIcon(id){
  const icons = {
    home:`<svg viewBox="0 0 24 24"><path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z"/></svg>`,
    board:`<svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>`,
    file:`<svg viewBox="0 0 24 24"><path d="M4 5h6l2 2h8v12H4z"/></svg>`,
    timeline:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l4 2"/></svg>`,
    theory:`<svg viewBox="0 0 24 24"><path d="M12 3v18M6 6h12M7 6 3 13h8L7 6Zm10 0-4 7h8l-4-7Z"/></svg>`
  };
  return icons[id];
}

function header(){
  return `<header class="topbar">
    <button class="brand clickTarget" onclick="goShelf()">
      <b>DOUBLE CROSS</b><small>${S.view==="home"?"SOLO MYSTERIES":C.title.toUpperCase()}</small>
    </button>
    <button class="help clickTarget" onclick="rules()"><i>?</i><em>How to Play</em></button>
  </header>`;
}

function bottom(){
  if(S.view==="home" || S.view==="brief") return "";
  return `<nav class="bottom"><div class="inner">
    <button class="nav clickTarget ${S.view==="brief"?"active":""}" onclick="go('brief')">${navIcon("home")}<span>Case Home</span></button>
    <button class="nav clickTarget ${S.view==="board"?"active":""}" onclick="go('board')">${navIcon("board")}<span>Case Board</span></button>
    <button class="nav clickTarget ${S.view==="notebook"?"active":""}" onclick="go('notebook')">${navIcon("file")}<span>Case File</span></button>
    <button class="nav clickTarget ${S.view==="timeline"?"active":""}" onclick="go('timeline')">${navIcon("timeline")}<span>Timeline</span></button>
    <button class="nav clickTarget ${S.view==="accuse"?"active":""}" onclick="go('accuse')">${navIcon("theory")}<span>Final Theory</span></button>
  </div></nav>`;
}

function render(){
  app.innerHTML = `<div class="app">${header()}<main>${view()}</main>${bottom()}</div>`;
}
function view(){
  if(S.view==="home") return home();
  if(S.view==="brief") return brief();
  if(S.view==="board") return board();
  if(S.view==="notebook") return notebook();
  if(S.view==="timeline") return timeline();
  return accuse();
}
function go(v){S.view=v;save();render();forceTop();}
function goShelf(){S.view="home";save();render();forceTop();}

function home(){
  return `<section class="hero"><div class="heroText">
    <div class="kicker">Double Cross · Solo Mysteries</div>
    <h1>Twelve cases. Twelve secrets. <span>One truth to uncover.</span></h1>
    <p>Facts, not conclusions. Follow the evidence. Decide what happened.</p>
  </div></section>
  <div class="sectionHead"><h2>The Murder Case Shelf</h2><small>Select a case</small></div>
  <div class="shelf">${D.cases.map(caseCard).join("")}</div>`;
}
function caseCard(c){
  const status = c.num===1 ? (S.result?.solved?"SOLVED":hasProgress()?"CASE OPEN":"NEW CASE") : "COMING SOON";
  const klass = c.num===1 ? (status==="NEW CASE"?"new":"") : "soon";
  return `<button class="caseCard clickTarget" style="--thumb:url('assets/cases/case-${String(c.num).padStart(2,"0")}.jpg')" onclick="${c.num===1?"openCase()":"comingSoon("+c.num+")"}">
    <div class="caseTop"><span class="caseNumber">${String(c.num).padStart(2,"0")}</span><span class="status ${klass}">${status}</span></div>
    <div class="no">MURDER CASE</div><h3>${esc(c.title)}</h3><p>${esc(c.teaser)}</p>
  </button>`;
}
function openCase(){S.view="brief";save();render();forceTop();}
function comingSoon(n){openModal(`
  <div class="modalHeader">
    <div><div class="kicker">MURDER CASE ${String(n).padStart(2,"0")}</div><h2>Coming Soon</h2><p>This mystery is part of the 12-case shelf.</p></div>
    <button class="close clickTarget" onclick="closeModal()">Close</button>
  </div>
  <div class="modalBody"><div class="infoPanel"><p>This case is not yet authored in this public-test build. Murder Case 01 remains fully playable while the remaining mysteries are developed.</p></div></div>
`);}

function meter(compact=false){
  const level = S.ip<=3?"red":S.ip<=6?"amber":S.ip<=9?"gold":"green";
  let seg="";
  for(let i=0;i<C.ip;i++) seg += `<i class="seg ${i<S.ip?"on":""}"></i>`;
  return `<div class="meter ${level} ${compact?"compact":""}">
    <div class="meterHead"><b>Investigation Time</b><span>${S.ip===0?"No time remaining":S.ip+" / "+C.ip}</span></div>
    <div class="segments">${seg}</div>
  </div>`;
}
function stickyMeter(){return `<div class="stickyMeter">${meter(true)}</div>`;}

function tacticBar(){
  if(!S.selected.length) return "";
  return `<div class="activeTactics">${S.selected.map(id=>`<button class="tacticChip clickTarget ${S.used[id]?"used":""}" onclick="useTactic('${id}')">
    <img src="${TACTICS[id].img}" alt=""><span><b>${TACTICS[id].short}${S.used[id]?" · USED":""}</b><small>${TACTICS[id].name}</small></span>
  </button>`).join("")}</div>`;
}

function workspaceSticky(extra=""){
  return `<div class="workspaceSticky">${meter(true)}${tacticBar()}${extra}</div>`;
}

function brief(){
  const need = DIFF[S.difficulty].n;
  return `<section class="caseHome">
    <div class="kicker">Murder Case 01 · Case Home</div><h1>${C.title}</h1>
    <p>${C.briefing}</p><p class="task"><b>Your task:</b> ${C.objective}</p>
    <div class="sectionHead"><h2>Choose Difficulty</h2><small>${need} Tactic${need>1?"s":""}</small></div>
    <div class="diffGrid">${Object.entries(DIFF).map(([id,d])=>`<button class="choice clickTarget ${S.difficulty===id?"active":""}" onclick="setDiff('${id}')" ${S.configured?"disabled":""}><b>${d.name}</b><small>${d.n} Tactic${d.n>1?"s":""} · ${d.desc}</small></button>`).join("")}</div>
    <div class="sectionHead"><h2>Choose Your Tactics</h2><small>${S.selected.length}/${need} selected</small></div>
    <div class="tacticGrid">${Object.entries(TACTICS).map(([id,t])=>`<button class="choice tactic tacticSelect clickTarget ${S.selected.includes(id)?"active":""}" onclick="toggleTactic('${id}')" ${S.configured?"disabled":""}>
      <div class="tacticArt"><img src="${t.img}" alt=""><span></span></div><div class="body"><b>${t.name}</b><small>${t.short}</small><p>${t.desc}</p></div>
    </button>`).join("")}</div>
    <button class="primary clickTarget" onclick="${S.configured?"go('board')":"begin()"}">${S.configured?"Resume Investigation":"Begin Investigation"}</button>
    <button class="secondary clickTarget" onclick="goShelf()">Exit to Murder Case Shelf</button>
    ${hasProgress()?`<button class="danger clickTarget" onclick="confirmReset()">Reset This Case</button>`:""}
  </section>`;
}
function setDiff(id){
  if(S.configured) return;
  S.difficulty=id;
  S.selected = id==="casual" ? ["intimidate","crossed","tampered"] : [];
  save();render();
}
function toggleTactic(id){
  if(S.configured || S.difficulty==="casual") return;
  const n=DIFF[S.difficulty].n;
  if(S.selected.includes(id)) S.selected=S.selected.filter(x=>x!==id);
  else if(S.selected.length<n) S.selected.push(id);
  else return toast(`Choose only ${n} Tactic${n>1?"s":""}.`);
  save();render();
}
function begin(){
  const n=DIFF[S.difficulty].n;
  if(S.difficulty==="casual") S.selected=["intimidate","crossed","tampered"];
  if(S.selected.length!==n) return toast(`Choose ${n} Tactic${n>1?"s":""} before beginning.`);
  S.configured=true;S.started=true;S.view="board";save();render();forceTop();
}
function confirmReset(){openModal(`
  <div class="modalHeader dangerHeader">
    <div><div class="kicker">RESET CASE</div><h2>Start over?</h2><p>This cannot be undone.</p></div>
    <button class="close clickTarget" onclick="closeModal()">Cancel</button>
  </div>
  <div class="modalBody">
    <div class="warningPanel">
      <b>Reset Murder Case 01</b>
      <p>This erases discovered facts, unlocked questions, eliminations, notes, Tactics, difficulty selection, Investigation Time, and your Final Theory.</p>
    </div>
    <div class="modalActions">
      <button class="secondary clickTarget" onclick="closeModal()">Keep My Progress</button>
      <button class="danger clickTarget" onclick="resetCase()">Reset Case</button>
    </div>
  </div>
`);}
function resetCase(){localStorage.removeItem(STORE);S=fresh();S.view="brief";save();closeModal();render();}

function cardData(cat){return cat==="suspects"?C.suspects:cat==="weapons"?C.weapons:C.locations;}
let boardCat="suspects";
function setBoard(cat){boardCat=cat;render();forceTop();}

function board(){
  const tabs=`<div class="tabs boardTabs">${["suspects","weapons","locations"].map(cat=>`<button class="tab clickTarget ${boardCat===cat?"active":""}" onclick="setBoard('${cat}')">${cat[0].toUpperCase()+cat.slice(1)} · ${cardData(cat).length}</button>`).join("")}</div>`;
  return `<div class="sectionHead boardHead"><div><div class="kicker">Pre-selected for this murder</div><h2>Case Board</h2></div><small>Tap a card to investigate</small></div>
  ${workspaceSticky(tabs)}
  <div class="cardGrid portraitGrid">${cardData(boardCat).map(c=>boardCard(c,boardCat)).join("")}</div>`;
}
function boardCard(c,cat){
  return `<button class="card portraitCard clickTarget ${S.eliminated[c.id]?"elim":""}" aria-label="${esc(c.name)}" onclick="openCard('${c.id}','${cat}')">
    <div class="portraitFrame"><img src="${c.src}" alt="${esc(c.name)}"></div>
    <div class="mobileCardLabel"><b>${esc(c.name)}</b>${c.subtitle?`<small>${esc(c.subtitle)}</small>`:""}</div>
    ${S.eliminated[c.id]?`<span class="cardState">ELIMINATED</span>`:""}
    ${unseenUnlockedForCard(c.id).length?`<span class="questionBadge">NEW QUESTION</span>`:""}
  </button>`;
}

function unlockedActionsFor(triggerId){
  return ACTIONS.filter(a=>a.requires===triggerId && !S.discovered.includes(a.id));
}
function unseenUnlockedForCard(cardId){
  return ACTIONS.filter(a=>a.card===cardId && a.requires && S.discovered.includes(a.requires) && !S.discovered.includes(a.id) && !S.seenUnlocks[a.id]);
}
function markCardUnlocksSeen(cardId){
  unseenUnlockedForCard(cardId).forEach(a=>S.seenUnlocks[a.id]=true);
  save();
}
function openCard(id,cat){
  const c=cardData(cat).find(x=>x.id===id);
  markCardUnlocksSeen(id);
  const acts=ACTIONS.filter(a=>a.card===id);
  const discovered=acts.filter(a=>S.discovered.includes(a.id));
  const available=acts.filter(a=>!S.discovered.includes(a.id) && (!a.requires || S.discovered.includes(a.requires)));
  openModal(`
    <div class="drawerPinned compactIdentity">
      <div class="drawerThumb"><img src="${c.src}" alt="${esc(c.name)}"></div>
      <div class="drawerIdentityText">
        <div class="kicker">${cat.slice(0,-1)}</div>
        <h2>${esc(c.name)}</h2>
        ${c.subtitle?`<p>${esc(c.subtitle)}</p>`:""}
      </div>
      <button class="close clickTarget" onclick="closeModal()">Close</button>
    </div>
    <div class="drawerScroll">
      <section class="drawerSection first"><h3>Background</h3><p>${esc(BACKGROUND[id]||"A person or object connected to Ravensworth Manor.")}</p></section>
      <section class="drawerStatus">
        <div><span class="drawerLabel">STATUS</span><b>${S.eliminated[id]?"Eliminated":"Still Open"}</b><small>${S.eliminated[id]?"Removed from your current theory.":"Still possible in your current theory."}</small></div>
        <button class="secondary inlineBtn clickTarget" onclick="toggleElim('${id}','${cat}')">${S.eliminated[id]?"Restore":"Mark Eliminated"}</button>
      </section>
      <section class="drawerSection">
        <div class="drawerSectionHead">
          <h3>Investigate</h3>
          <span class="countPill">${available.length} ${available.length===1?"lead":"leads"} available</span>
        </div>
        <div class="actions">${available.map(actionHTML).join("")||`<div class="emptyState">No unused investigations remain for this card.</div>`}</div>
      </section>
      <section class="drawerSection">
        <div class="drawerSectionHead">
          <h3>Discovered Facts</h3>
          <span class="countPill">${discovered.length} ${discovered.length===1?"fact":"facts"}</span>
        </div>
        ${discovered.length?discovered.map(a=>`<article class="miniFact"><span class="tag">${a.tag}</span><b>${esc(a.clueTitle)}</b><p>${esc(a.text)}</p></article>`).join(""):`<div class="emptyState">No facts discovered about this card yet.</div>`}
      </section>
    </div>`);
}
function toggleElim(id,cat){S.eliminated[id]=!S.eliminated[id];save();closeModal();render();}

function actionHTML(a){
  const done=S.discovered.includes(a.id);
  const locked=!!(a.requires&&!S.discovered.includes(a.requires));
  const afford=S.ip>=a.cost;
  return `<button class="action clickTarget ${done?"done":""} ${locked||!afford?"disabled":""}" ${!done&&!locked&&afford?`onclick="doAction('${a.id}')"`:"disabled"}>
    <div class="copy"><b>${esc(a.label)}</b><small>${done?"Already investigated":locked?"Requires another discovery":!afford?"No Investigation Time remaining":"Tap to investigate"}</small></div>
    <span class="cost">Cost ${a.cost}</span>
  </button>`;
}
function doAction(id){
  const a=ACTIONS.find(x=>x.id===id);
  if(!a || S.discovered.includes(id) || S.ip<a.cost || (a.requires&&!S.discovered.includes(a.requires))) return;
  S.ip-=a.cost;S.discovered.push(id);
  const unlocked=unlockedActionsFor(id);
  save();
  openModal(`
    <div class="modalHeader">
      <div><div class="kicker">${a.tag}</div><h2>${esc(a.clueTitle)}</h2><p>New fact added to your Case File.</p></div>
      <button class="close clickTarget" onclick="closeModal();render()">Close</button>
    </div>
    <div class="modalBody">
      <div class="factReveal">${esc(a.text)}</div>
      <div class="factReminder">This is a fact or statement, not a conclusion. Decide what it changes in your theory.</div>
      ${unlocked.length?`<div class="unlockPanel"><div class="unlockIcon">?</div><div><span>NEW LINE OF QUESTIONING</span><b>${unlocked.length===1?esc(unlocked[0].label):`${unlocked.length} new leads unlocked`}</b><p>${unlocked.length===1?`New information has opened a follow-up with ${esc(cardData("suspects").find(s=>s.id===unlocked[0].card)?.name||"a suspect")}.`:"Return to the Case Board to follow the new leads."}</p></div></div>`:""}
    </div>
  `);
}

function notebook(){
  const clues=S.discovered.map(id=>ACTIONS.find(a=>a.id===id)).filter(Boolean);
  const groups={TESTIMONY:[],FORENSIC:[],PHYSICAL:[],SCENE:[],TIMELINE:[],SIGHTING:[],ALIBI:[],MOTIVE:[]};
  clues.forEach(c=>(groups[c.tag]||(groups[c.tag]=[])).push(c));
  const activeGroups=Object.entries(groups).filter(([,arr])=>arr.length);
  return `<div class="sectionHead"><div><div class="kicker">Facts, not conclusions</div><h2>Case File</h2></div><small>${clues.length} facts discovered</small></div>
  ${workspaceSticky()}
  <div class="fileSummary">${activeGroups.map(([tag,arr])=>`<span><b>${arr.length}</b>${tag}</span>`).join("")}</div>
  <div class="caseFileGroups">${activeGroups.map(([tag,arr])=>`<section class="fileGroup"><div class="fileGroupHead"><h3>${tag}</h3><small>${arr.length} fact${arr.length===1?"":"s"}</small></div>${arr.map(c=>`<article class="clue compactClue"><span class="tag">${tag}</span><h3>${esc(c.clueTitle)}</h3><p>${esc(c.text)}</p></article>`).join("")}</section>`).join("") || `<div class="emptyState">No facts discovered yet.</div>`}</div>
  ${Object.keys(S.pressed).filter(k=>S.pressed[k]).map(id=>`<article class="clue compactClue"><span class="tag">FOLLOW-UP</span><h3>Pressed Witness</h3><p>${esc(PRESS[id])}</p></article>`).join("")}
  ${Object.keys(S.second).filter(k=>S.second[k]).map(id=>`<article class="clue compactClue"><span class="tag">SECOND LOOK</span><h3>Additional Forensic Detail</h3><p>${esc(SECOND[id])}</p></article>`).join("")}
  <div class="sectionHead"><h2>Detective Notes</h2><small>Saved on this device</small></div>
  <textarea id="notes" class="notes" placeholder="Timeline, contradictions, theories…">${esc(S.notes)}</textarea>
  <button class="secondary clickTarget" onclick="saveNotes()">Save Notes</button>`;
}
function saveNotes(){S.notes=document.getElementById("notes").value;save();toast("Notes saved.");}

function timeline(){
  const entries=[];
  for(const id of S.discovered){
    if(TIMELINE[id]) entries.push({...TIMELINE[id], source:ACTIONS.find(a=>a.id===id)?.clueTitle||"Discovered Fact"});
  }
  if(S.started) entries.push({...TIMELINE.discovery, source:"Body Discovered"});
  const toMinutes=t=>{
    const m=t.match(/(\d+):(\d+)(?:–(\d+):(\d+))?\s*(AM|PM)/);
    if(!m) return 9999;
    let h=Number(m[1])%12 + (m[5]==="PM"?12:0);
    return h*60+Number(m[2]);
  };
  entries.sort((a,b)=>toMinutes(a.time)-toMinutes(b.time));
  return `<div class="sectionHead"><div><div class="kicker">What happened when</div><h2>Timeline</h2></div><small>Discovered facts only</small></div>
    ${workspaceSticky()}
    <div class="timelineIntro">The timeline organizes facts you have uncovered. It does not tell you which statements are true.</div>
    <div class="timeline">${entries.length?entries.map(e=>`<article class="timeRow"><div class="time">${esc(e.time)}</div><div class="timelineMarker"><span></span></div><div class="timeFact"><span class="timeSource">${esc(e.source)}</span><p>${esc(e.text)}</p></div></article>`).join(""):`<div class="emptyState">Discover time-based facts to build the timeline.</div>`}</div>`;
}


function optionDrawer(kicker,title,subtitle,itemsHtml){
  openModal(`
    <div class="modalHeader tacticModalHeader">
      <div><div class="kicker">${esc(kicker)}</div><h2>${esc(title)}</h2>${subtitle?`<p>${esc(subtitle)}</p>`:""}</div>
      <button class="close clickTarget" onclick="closeModal()">Close</button>
    </div>
    <div class="modalBody tacticModalBody">
      <div class="drawerOptionList">${itemsHtml}</div>
    </div>
  `);
}
function detailDrawer(kicker,title,text,reminder="",onClose="closeModal();render()"){
  openModal(`
    <div class="modalHeader tacticModalHeader">
      <div><div class="kicker">${esc(kicker)}</div><h2>${esc(title)}</h2></div>
      <button class="close clickTarget" onclick="${onClose}">Close</button>
    </div>
    <div class="modalBody">
      <div class="factReveal">${esc(text)}</div>
      ${reminder?`<div class="factReminder">${esc(reminder)}</div>`:""}
    </div>
  `);
}
function useTactic(id){
  if(S.used[id]) return toast(`${TACTICS[id].short} has already been used.`);
  if(id==="intimidate") return press();
  if(id==="tampered") return secondLook();
  return crossed();
}
function press(){
  const ids=S.discovered.filter(id=>PRESS[id]&&!S.pressed[id]);
  if(!ids.length) return toast("Press the Witness becomes available after you uncover a suspect statement.");
  const rows=ids.map(id=>{
    const a=ACTIONS.find(x=>x.id===id);
    return `<button class="drawerOption clickTarget" onclick="resolvePress('${id}')">
      <span class="drawerOptionText"><b>${esc(a.clueTitle)}</b><small>${esc(a.label)}</small></span>
      <span class="drawerChevron">›</span>
    </button>`;
  }).join("");
  optionDrawer("PRESS THE WITNESS","Who do you challenge?","Choose one discovered statement to press further.",rows);
}
function resolvePress(id){
  S.used.intimidate=true;S.pressed[id]=true;save();
  detailDrawer("FOLLOW-UP","Pressed Statement",PRESS[id],"A changed statement is still testimony, not proof.");
}
function secondLook(){
  const ids=S.discovered.filter(id=>SECOND[id]&&!S.second[id]);
  if(!ids.length) return toast("Second Look becomes available after you examine physical evidence.");
  const rows=ids.map(id=>{
    const a=ACTIONS.find(x=>x.id===id);
    return `<button class="drawerOption clickTarget" onclick="resolveSecond('${id}')">
      <span class="drawerOptionText"><b>${esc(a.clueTitle)}</b><small>Free deeper examination</small></span>
      <span class="drawerChevron">›</span>
    </button>`;
  }).join("");
  optionDrawer("SECOND LOOK","Re-examine which evidence?","Choose one piece of physical evidence.",rows);
}
function resolveSecond(id){
  S.used.tampered=true;S.second[id]=true;save();
  detailDrawer("SECOND LOOK","Additional Detail",SECOND[id]);
}
function crossed(){
  if(S.discovered.length<2) return toast("You need at least two discovered facts.");
  const rows=S.discovered.map(id=>{
    const a=ACTIONS.find(x=>x.id===id);
    return `<button class="drawerOption clickTarget" onclick="pickSecond('${id}')">
      <span class="drawerOptionText"><b>${esc(a.clueTitle)}</b><small>${esc(a.tag)}</small></span>
      <span class="drawerChevron">›</span>
    </button>`;
  }).join("");
  optionDrawer("FOLLOW ANOTHER LEAD","Select the first fact","Choose the first half of a possible contradiction.",rows);
}
function pickSecond(first){
  const rows=S.discovered.filter(id=>id!==first).map(id=>{
    const a=ACTIONS.find(x=>x.id===id);
    return `<button class="drawerOption clickTarget" onclick="resolveContra('${first}','${id}')">
      <span class="drawerOptionText"><b>${esc(a.clueTitle)}</b><small>${esc(a.tag)}</small></span>
      <span class="drawerChevron">›</span>
    </button>`;
  }).join("");
  optionDrawer("FOLLOW ANOTHER LEAD","Select the conflicting fact","Choose the fact you believe contradicts the first.",rows);
}
function resolveContra(a,b){
  const ok=CONTRA.some(p=>p.includes(a)&&p.includes(b));
  if(ok){
    S.used.crossed=true;S.ip=Math.min(C.ip,S.ip+1);save();
    detailDrawer("CONTRADICTION CONFIRMED","+1 Investigation Time","Those facts cannot both be true as stated.");
  }else{
    detailDrawer("NO DIRECT CONTRADICTION","Keep working the case","Those facts may both be true. Crossed Wires was not consumed.","Try another pairing or continue investigating.","closeModal()");
  }
}

function opts(arr,selected=""){return `<option value="">Choose…</option>${arr.map(x=>`<option value="${x.id}" ${x.id===selected?"selected":""}>${esc(x.name)}</option>`).join("")}`;}
function accuse(){
  const last=S.result||{};
  const incorrect=last.incorrectAttempts||0;
  return `<div class="sectionHead theoryPageHead">
    <div><div class="kicker">When you are ready</div><h2>Final Theory</h2></div>
    ${incorrect?`<span class="attemptPill">Incorrect theories · ${incorrect}</span>`:""}
  </div>
  ${workspaceSticky()}
  <section class="accuseCard">
    <div class="theorySection coreTheory">
      <div class="theoryHead"><div><span class="theoryStep">SOLVE THE MURDER</span><h3>What really happened?</h3></div></div>
      <p class="accuseIntro">${S.ip===0?"Investigation Time is gone, but the case is not. Review what you discovered and make your best deduction.":"You can submit a theory whenever you believe the evidence fits."}</p>
      <div class="formGrid">
        <label class="field"><span>WHO DID IT?</span><select id="as">${opts(C.suspects,last.suspect||"")}</select></label>
        <label class="field"><span>WHAT WAS USED?</span><select id="aw">${opts(C.weapons,last.weapon||"")}</select></label>
        <label class="field full"><span>WHERE DID THE KILLING OCCUR?</span><select id="al">${opts(C.locations,last.location||"")}</select></label>
      </div>
    </div>
    <button class="primary clickTarget" onclick="confirmTheory()">Submit Final Theory</button>
    ${resultHTML()}
  </section>`;
}
function confirmTheory(){
  const suspect=document.getElementById("as").value, weapon=document.getElementById("aw").value, location=document.getElementById("al").value;
  if(!suspect||!weapon||!location) return toast("Choose a suspect, weapon, and location.");
  openModal(`
    <div class="modalHeader">
      <div><div class="kicker">FINAL THEORY</div><h2>Submit this theory?</h2><p>If it is wrong, you will learn only how many of the three deductions are correct.</p></div>
      <button class="close clickTarget" onclick="closeModal()">Review</button>
    </div>
    <div class="modalBody">
      <div class="theoryConfirm">
        <p><b>Who:</b> ${esc(C.suspects.find(x=>x.id===suspect).name)}</p>
        <p><b>What:</b> ${esc(C.weapons.find(x=>x.id===weapon).name)}</p>
        <p><b>Where:</b> ${esc(C.locations.find(x=>x.id===location).name)}</p>
      </div>
      <div class="modalActions">
        <button class="secondary clickTarget" onclick="closeModal()">Keep Reviewing</button>
        <button class="primary clickTarget" onclick="submitTheory('${suspect}','${weapon}','${location}')">Submit Theory</button>
      </div>
    </div>`);
}
function submitTheory(suspect,weapon,location){
  const core=(suspect===C.solution.suspect)+(weapon===C.solution.weapon)+(location===C.solution.location);
  const priorIncorrect=S.result?.incorrectAttempts||0;
  S.result={
    suspect,weapon,location,core,
    solved:core===3,
    incorrectAttempts:priorIncorrect+(core===3?0:1)
  };
  save();
  closeModal();
  render();
  if(core===3){
    forceTop();
  }else{
    setTimeout(()=>showTheoryFailure(core),0);
  }
}
function showTheoryFailure(core){
  openModal(`
    <div class="modalHeader theoryFailHeader">
      <div><div class="kicker">THE THEORY DOESN'T HOLD</div><h2>${core} of 3 deductions are correct.</h2><p>Your theory is close, but something still conflicts with the evidence.</p></div>
      <button class="close clickTarget" onclick="closeModal()">Close</button>
    </div>
    <div class="modalBody">
      <div class="failureMessage">The case will not identify which deduction is wrong. Your submitted choices are still selected on the Final Theory screen so you can revise only what you want to reconsider.</div>
      <div class="modalActions">
        <button class="secondary clickTarget" onclick="closeModal()">Revise Theory</button>
        <button class="primary clickTarget" onclick="closeModal();go('board')">Continue Investigating</button>
      </div>
    </div>
  `);
}
function resultHTML(){
  if(!S.result || !S.result.solved) return "";
  const killer=C.suspects.find(x=>x.id===C.solution.suspect).name;
  const weapon=C.weapons.find(x=>x.id===C.solution.weapon).name;
  const location=C.locations.find(x=>x.id===C.solution.location).name;
  return `<article class="caseSolved">
    <div class="solvedBanner"><span>CASE SOLVED</span><h2>You uncovered the truth behind ${esc(C.title)}.</h2><p><b>${esc(killer)}</b> killed Nathaniel Crowe with <b>${esc(weapon)}</b> in <b>${esc(location)}</b>.</p></div>
    <div class="reconstructionInline">
      <div class="kicker">CASE RECONSTRUCTION</div><h3>What really happened</h3>
      <p>Nathaniel Crowe had been hired to explain why valuable Ravensworth antiques were quietly disappearing. By comparing estate inventories, freight records, and staff movements, he discovered a pattern: small objects left the manor on nights when <b>Jasper Wilde</b> had the motorcar, then traveled through the railway freight depot under receipts initialed <b>J.W.</b></p>
      <p>Crowe learned the thefts were being moved through the <b>Boathouse</b>. The service road let Jasper reach the lake and railway road without passing the main gates. Jasper had been selling the pieces through a discreet foreign dealer and using his ordinary driving duties as cover.</p>
      <p>On the night of the murder, Crowe intended to confront Jasper before reporting everything to Lord Ravensworth. Jasper drove to the Boathouse and met him there shortly before midnight. The argument turned violent. Jasper seized the heavy <b>Fire Poker</b> beside the stove and struck Crowe once behind the ear.</p>
      <p>Jasper wiped the poker, took Crowe's evidence satchel, and moved the body to the <b>Rose Garden</b>, hoping the storm would erase the route and make the death look like a fall or an attack elsewhere. It nearly worked.</p>
      <div class="reconEvidence"><b>How the case comes together</b><p>The dry wood shavings and soot on Crowe's rain-soaked clothing show he died indoors before being placed outside. The Boathouse had no forced entry, Jasper possessed the spare key, the service road carried fresh motorcar tracks, and the lake-shell grit contradicted Jasper's original alibi. The wiped section of the Fire Poker carried Crowe's blood. The transport receipts and missing antiques explain why Jasper needed Crowe silenced.</p></div>
      <p class="closingLine">The facts never announced the answer. Together, they made Jasper's story impossible.</p>
    </div>
  </article>`;
}

function rules(){openModal(`
  <div class="modalHeader">
    <div><div class="kicker">DOUBLE CROSS</div><h2>How to Play</h2><p>Investigate facts. Build your own conclusion.</p></div>
    <button class="close clickTarget" onclick="closeModal()">Close</button>
  </div>
  <div class="modalBody helpBody">
    <section class="helpStep"><span>1</span><div><h3>Choose a case and difficulty</h3><p>Casual Detective gets all 3 Tactics automatically. Detective chooses 2. Master Detective chooses 1.</p></div></section>
    <section class="helpStep"><span>2</span><div><h3>Investigate through the Case Board</h3><p>Tap any Suspect, Weapon, or Location. Evidence can unlock new questions later, so watch for NEW QUESTION markers.</p></div></section>
    <section class="helpStep"><span>3</span><div><h3>Spend Investigation Time carefully</h3><p>Most actions cost 1 point. Deeper forensic work can cost 2. You cannot uncover everything.</p></div></section>
    <section class="helpStep"><span>4</span><div><h3>Use your Case File and Timeline</h3><p>The Case File stores discovered facts. The Timeline arranges time-based facts without telling you which statements are true.</p></div></section>
    <section class="helpStep"><span>5</span><div><h3>Make your Final Theory</h3><p>Solve <b>Who + Weapon + Location</b>. A wrong theory tells you only how many of the three are correct, never which ones. At zero Investigation Time you may still review the case and submit a theory.</p></div></section>
  </div>`);}
function toast(t){openModal(`
  <div class="modalHeader compactModalHeader">
    <div><div class="alertIcon" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.7 2.4 17.3A2 2 0 0 0 4.1 20h15.8a2 2 0 0 0 1.7-2.7L13.7 3.7a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg></div><h2>${esc(t)}</h2></div>
    <button class="close clickTarget" onclick="closeModal()">Close</button>
  </div>
  <div class="modalBody alertBody"><p>Review the requirement, then try again.</p></div>`);}

render();
