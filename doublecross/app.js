
const D = window.DOUBLE_CROSS_DATA;
const C = D.case1;
const ACTIONS = D.actions;
const STORE = "doubleCrossSolo_v16";

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
  evelyn:"The Ravensworth family's physician for more than a decade. Calm, observant, and trusted with matters the household prefers to keep private.",
  sebastian:"The family's polished solicitor and keeper of many of its legal affairs. Meticulous, discreet, and rarely caught without a document in hand.",
  alistair:"A longtime business associate of Lord Ravensworth. Nervous by temperament, but deeply familiar with the estate's finances and outside ventures.",
  harriet:"The manor's stern housekeeper, responsible for its staff, routines, and countless domestic details. Little happens in the house without her noticing.",
  jasper:"The young chauffeur responsible for the Ravensworth motorcar. Confident, quick-witted, and often moving between the manor and grounds at odd hours.",
  lucian:"Lord Ravensworth's estranged son, recently returned from years at sea. Their relationship is strained, and his homecoming has unsettled the household.",
  letteropener:"An antique silver letter opener with an ivory handle, normally kept among Lord Ravensworth's correspondence.",
  decanter:"A heavy cut-crystal whisky decanter from the manor's drawing rooms, routinely set out for evening guests.",
  pistol:"An ornate 19th-century dueling pistol from the Ravensworth collection, more display piece than everyday weapon.",
  firepoker:"A heavy wrought-iron poker kept beside one of the manor's large fireplaces.",
  fountainpen:"An elegant black-and-gold fountain pen used for formal correspondence and legal signatures.",
  rifle:"A vintage double-barreled hunting rifle kept with the estate's sporting equipment.",
  library:"The manor's tall, shadowed library, lined with dark oak shelves and used for reading, private conversation, and late-night solitude.",
  winecellar:"A cool vaulted cellar beneath the manor, packed with dusty racks and old vintages.",
  study:"Lord Ravensworth's private working room, used for estate business, correspondence, and meetings conducted behind closed doors.",
  rosegarden:"A formal garden of gravel paths, clipped hedges, stone urns, and old rose beds surrounding a marble fountain.",
  boathouse:"A dim lakeside structure used for the estate's rowboats and fishing equipment, separated from the manor by a misty path.",
  masterbedroom:"Lord Ravensworth's opulent private bedroom, dominated by a four-poster bed, heavy drapery, and personal effects."
};

const PRESS = {
  evelyn_exam:"Dr. Marsh adds that a pinprick alone would not normally be fatal. Whatever entered the wound had to be potent and deliberately delivered.",
  sebastian_statement:"Pressed, Cole changes his account: Ravensworth did summon him again later, but Cole insists he ignored the summons and never entered the Study.",
  alistair_statement:"Finch admits he and Ravensworth had argued over money earlier, but says the transfer ledgers were Cole's responsibility, not his.",
  harriet_bell:"Mrs. Bloom is certain the second voice was male. She cannot swear it was Cole, but she heard papers being moved before the bell rang.",
  jasper_hall:"Jasper adds that Cole's document wallet looked unusually full when he approached the Study and much thinner when he saw him later.",
  lucian_alibi:"Vale becomes irritated but sticks to his account. He says the night watchman can verify he remained near the lake."
};

const SECOND = {
  opener_lab:"The wax is the same burgundy sealing wax used on Ravensworth's legal correspondence. There is still no biological trace on the blade.",
  decanter_lab:"The glass stopper and rim carry only Ravensworth's and the housekeeper's prints. No foreign powder or residue is present.",
  pistol_lab:"The lock mechanism is dry and stiff. It has not been handled recently enough to have been fired tonight.",
  poker_lab:"Fireplace ash trapped in the decorative grooves is undisturbed. The poker was not recently cleaned or wiped.",
  pen_lab:"Beneath the nib collar is a tiny modified spring point designed to puncture a finger when pressure is applied while signing.",
  rifle_lab:"The spent cartridge is from a different batch than the cartridges currently stored with the rifle."
};

const CONTRA = [
  ["sebastian_statement","harriet_bell"],
  ["sebastian_statement","jasper_hall"],
  ["sebastian_statement","alistair_statement"]
];

const TIMELINE = {
  library_clock:{time:"10:42 PM", text:"The Library clock stopped when it was knocked crooked."},
  lucian_alibi:{time:"10:53 PM", text:"Captain Vale's initials appear in the boathouse log."},
  alistair_statement:{time:"11:00 PM", text:"Ravensworth expected Cole in the Study with transfer ledgers and revised papers."},
  jasper_hall:{time:"11:02 PM", text:"Jasper saw Cole walking toward the Study carrying a document wallet."},
  harriet_bell:{time:"11:08 PM", text:"The Study bell rang; Mrs. Bloom heard Ravensworth address 'Cole.'"},
  evelyn_exam:{time:"11:05–11:20 PM", text:"Dr. Marsh estimates the victim died during this window."},
  lucian_alibi_watch:{time:"11:18 PM", text:"The night watchman recorded the boathouse lantern still burning."},
  discovery:{time:"11:35 PM", text:"Lord Ravensworth was found beside the Library reading table."}
};

function fresh(){
  return {
    started:false, configured:false, view:"home", ip:C.ip,
    discovered:[], eliminated:{}, notes:"", result:null,
    difficulty:"detective", selected:[], used:{}, pressed:{}, second:{}
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
      <b>DOUBLE CROSS</b><small>${S.view==="home"?"SOLO MYSTERIES":"THE LAST SIGNATURE"}</small>
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
      <p>This erases discovered facts, eliminations, notes, Tactics, difficulty selection, Investigation Time, and your accusation.</p>
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
    ${S.eliminated[c.id]?`<span class="cardState">ELIMINATED</span>`:""}
  </button>`;
}

function openCard(id,cat){
  const c=cardData(cat).find(x=>x.id===id);
  const acts=ACTIONS.filter(a=>a.card===id);
  const discovered=acts.filter(a=>S.discovered.includes(a.id));
  const available=acts.filter(a=>!S.discovered.includes(a.id));
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
  const locked=a.requires&&!S.discovered.includes(a.requires);
  const afford=S.ip>=a.cost;
  return `<button class="action clickTarget ${done?"done":""} ${locked||!afford?"disabled":""}" ${!done&&!locked&&afford?`onclick="doAction('${a.id}')"`:"disabled"}>
    <div class="copy"><b>${esc(a.label)}</b><small>${done?"Already investigated":locked?"Requires another discovery":!afford?"Not enough Investigation Time":"Tap to investigate"}</small></div>
    <span class="cost">Cost ${a.cost}</span>
  </button>`;
}
function doAction(id){
  const a=ACTIONS.find(x=>x.id===id);
  if(!a || S.discovered.includes(id) || S.ip<a.cost || (a.requires&&!S.discovered.includes(a.requires))) return;
  S.ip-=a.cost;S.discovered.push(id);save();
  openModal(`
  <div class="modalHeader">
    <div><div class="kicker">${a.tag}</div><h2>${esc(a.clueTitle)}</h2><p>New fact added to your Case File.</p></div>
    <button class="close clickTarget" onclick="closeModal();render()">Close</button>
  </div>
  <div class="modalBody">
    <div class="factReveal">${esc(a.text)}</div>
    <div class="factReminder">This is a fact or statement, not a conclusion. Decide what it changes in your theory.</div>
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
    if(id==="lucian_alibi" && TIMELINE.lucian_alibi_watch) entries.push({...TIMELINE.lucian_alibi_watch, source:"Boathouse Log"});
  }
  if(S.started) entries.push({...TIMELINE.discovery, source:"Body Discovered"});
  const order={"10:42 PM":1,"10:53 PM":2,"11:00 PM":3,"11:02 PM":4,"11:05–11:20 PM":5,"11:08 PM":6,"11:18 PM":7,"11:35 PM":8};
  entries.sort((a,b)=>(order[a.time]||99)-(order[b.time]||99));
  return `<div class="sectionHead"><div><div class="kicker">What happened when</div><h2>Timeline</h2></div><small>Discovered facts only</small></div>
    ${workspaceSticky()}
    <div class="timelineIntro">The timeline organizes facts you have uncovered. It does not tell you which statements are true.</div>
    <div class="timeline">${entries.length?entries.map((e,i)=>`<article class="timeRow"><div class="time">${esc(e.time)}</div><div class="timelineMarker"><span></span></div><div class="timeFact"><span class="timeSource">${esc(e.source)}</span><p>${esc(e.text)}</p></div></article>`).join(""):`<div class="emptyState">Discover time-based facts to build the timeline.</div>`}</div>`;
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
  openModal(`<button class="close clickTarget" onclick="closeModal()">Close</button><div class="kicker">Press the Witness</div><h2>Who do you challenge?</h2><div class="actions">${ids.map(id=>{const a=ACTIONS.find(x=>x.id===id);return `<button class="action clickTarget" onclick="resolvePress('${id}')"><div class="copy"><b>${esc(a.clueTitle)}</b><small>${esc(a.label)}</small></div></button>`;}).join("")}</div>`);
}
function resolvePress(id){S.used.intimidate=true;S.pressed[id]=true;save();openModal(`<button class="close clickTarget" onclick="closeModal();render()">Close</button><span class="tag">FOLLOW-UP</span><h2>Pressed Statement</h2><p>${esc(PRESS[id])}</p><div class="task">A changed statement is still testimony, not proof.</div>`);}
function secondLook(){
  const ids=S.discovered.filter(id=>SECOND[id]&&!S.second[id]);
  if(!ids.length) return toast("Second Look becomes available after you examine physical evidence.");
  openModal(`<button class="close clickTarget" onclick="closeModal()">Close</button><div class="kicker">Second Look</div><h2>Re-examine which evidence?</h2><div class="actions">${ids.map(id=>{const a=ACTIONS.find(x=>x.id===id);return `<button class="action clickTarget" onclick="resolveSecond('${id}')"><div class="copy"><b>${esc(a.clueTitle)}</b><small>Free deeper examination</small></div></button>`;}).join("")}</div>`);
}
function resolveSecond(id){S.used.tampered=true;S.second[id]=true;save();openModal(`<button class="close clickTarget" onclick="closeModal();render()">Close</button><span class="tag">SECOND LOOK</span><h2>Additional Detail</h2><p>${esc(SECOND[id])}</p>`);}
function crossed(){
  if(S.discovered.length<2) return toast("You need at least two discovered facts.");
  openModal(`<button class="close clickTarget" onclick="closeModal()">Close</button><div class="kicker">Follow Another Lead</div><h2>Select the first fact</h2><div class="actions">${S.discovered.map(id=>`<button class="action clickTarget" onclick="pickSecond('${id}')"><div class="copy"><b>${esc(ACTIONS.find(a=>a.id===id).clueTitle)}</b></div></button>`).join("")}</div>`);
}
function pickSecond(first){openModal(`<button class="close clickTarget" onclick="closeModal()">Close</button><div class="kicker">Follow Another Lead</div><h2>Select the conflicting fact</h2><div class="actions">${S.discovered.filter(id=>id!==first).map(id=>`<button class="action clickTarget" onclick="resolveContra('${first}','${id}')"><div class="copy"><b>${esc(ACTIONS.find(a=>a.id===id).clueTitle)}</b></div></button>`).join("")}</div>`);}
function resolveContra(a,b){
  const ok=CONTRA.some(p=>p.includes(a)&&p.includes(b));
  if(ok){S.used.crossed=true;S.ip=Math.min(C.ip,S.ip+1);save();openModal(`<button class="close clickTarget" onclick="closeModal();render()">Close</button><div class="kicker">Contradiction Confirmed</div><h2>+1 Investigation Time</h2><p>Those facts cannot both be true as stated.</p>`);}
  else openModal(`<button class="close clickTarget" onclick="closeModal()">Close</button><div class="kicker">Not a Direct Contradiction</div><h2>Keep working the case</h2><p>Those facts may both be true. Crossed Wires was not consumed.</p>`);
}

function opts(arr){return `<option value="">Choose…</option>${arr.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("")}`;}
function accuse(){
  const clues=S.discovered.map(id=>ACTIONS.find(a=>a.id===id)).filter(Boolean);
  return `<div class="sectionHead"><div><div class="kicker">You may accuse at any time</div><h2>Final Theory</h2></div></div>
  ${workspaceSticky()}
  <section class="accuseCard">
    <div class="theorySection coreTheory">
      <div class="theoryHead"><div><span class="theoryStep">CORE SOLUTION</span><h3>Solve the Murder</h3></div><small>Required</small></div>
      <p class="accuseIntro">Identify the murderer, weapon, and true crime scene.</p>
      <div class="formGrid">
        <label class="field"><span>WHO DID IT?</span><select id="as">${opts(C.suspects)}</select></label>
        <label class="field"><span>WHAT WAS USED?</span><select id="aw">${opts(C.weapons)}</select></label>
        <label class="field full"><span>WHERE DID THE KILLING OCCUR?</span><select id="al">${opts(C.locations)}</select></label>
      </div>
    </div>
    <div class="theorySection bonusTheory">
      <div class="theoryHead"><div><span class="theoryStep">BONUS DEDUCTION</span><h3>Explain Your Case</h3></div><small>Optional · +2</small></div>
      <p class="accuseIntro">Show how well you understood the motive and evidence.</p>
      <div class="formGrid">
        <label class="field"><span>WHY?</span><select id="am"><option value="">Choose…</option>${C.motives.map(x=>`<option>${esc(x)}</option>`).join("")}</select></label>
        <label class="field"><span>WHICH CLUE BEST PROVES IT?</span><select id="ap"><option value="">Choose…</option>${clues.map(x=>`<option value="${x.id}">${esc(x.clueTitle)}</option>`).join("")}</select></label>
      </div>
    </div>
    <button class="primary clickTarget" onclick="submit()">Make the Accusation</button>
    ${resultHTML()}
  </section>`;
}
function submit(){
  const a={suspect:document.getElementById("as").value,weapon:document.getElementById("aw").value,location:document.getElementById("al").value,motive:document.getElementById("am").value,proof:document.getElementById("ap").value};
  if(!a.suspect||!a.weapon||!a.location) return toast("Choose a suspect, weapon, and location.");
  const core=(a.suspect===C.solution.suspect)+(a.weapon===C.solution.weapon)+(a.location===C.solution.location);
  const bonus=(a.motive===C.solution.motive)+C.solution.proof.includes(a.proof);
  S.result={...a,core,bonus,total:core+bonus,solved:core===3};save();render();
}
function resultHTML(){
  if(!S.result) return "";
  return `<article class="resultCard ${S.result.solved?"solved":"unsolved"}"><span class="tag">${S.result.solved?"CASE SOLVED":"THEORY INCOMPLETE"}</span><h3>${S.result.total} / 5</h3><p>Core deduction: ${S.result.core}/3 · Bonus reasoning: ${S.result.bonus}/2</p>${S.result.solved?`<button class="secondary clickTarget" onclick="reconstruct()">Read Case Reconstruction</button>`:""}</article>`;
}
function reconstruct(){openModal(`
  <div class="modalHeader">
    <div><div class="kicker">CASE RECONSTRUCTION</div><h2>The Last Signature</h2><p>What really happened.</p></div>
    <button class="close clickTarget" onclick="closeModal()">Close</button>
  </div>
  <div class="modalBody reconstruction">
    <p>Lord Ravensworth summoned <b>Mr. Sebastian Cole</b> to <b>The Study</b> to sign a revised codicil removing Cole as trustee and confront him over false estate transfers.</p>
    <p>Cole prepared <b>The Poisoned Fountain Pen</b>. The modified nib punctured Ravensworth's thumb and delivered concentrated digitalis. He later moved Ravensworth to the Library to disguise the true scene.</p>
    <p>The 11:08 Study bell, witness sightings, fresh blood and signature impression on the Study blotter, and the poisoned nib expose the deception.</p>
  </div>
`);}

function rules(){openModal(`
  <div class="modalHeader">
    <div><div class="kicker">DOUBLE CROSS</div><h2>How to Play</h2><p>Investigate facts. Build your own conclusion.</p></div>
    <button class="close clickTarget" onclick="closeModal()">Close</button>
  </div>
  <div class="modalBody helpBody">
    <section class="helpStep"><span>1</span><div><h3>Choose a case and difficulty</h3><p>Casual Detective gets all 3 Tactics automatically. Detective chooses 2. Master Detective chooses 1.</p></div></section>
    <section class="helpStep"><span>2</span><div><h3>Investigate through the Case Board</h3><p>Tap any Suspect, Weapon, or Location. Its drawer contains background information and available investigation actions.</p></div></section>
    <section class="helpStep"><span>3</span><div><h3>Spend Investigation Time carefully</h3><p>Most actions cost 1 point. Deeper forensic work can cost 2. You cannot uncover everything.</p></div></section>
    <section class="helpStep"><span>4</span><div><h3>Use your Case File and Timeline</h3><p>The Case File stores discovered facts. The Timeline arranges time-based facts without telling you which statements are true.</p></div></section>
    <section class="helpStep"><span>5</span><div><h3>Make your Final Theory</h3><p>The core solve is <b>Who + Weapon + Location</b>. Motive and strongest proving clue are optional bonus deductions.</p></div></section>
  </div>`);}
function toast(t){openModal(`
  <div class="modalHeader compactModalHeader">
    <div><div class="alertIcon">!</div><h2>${esc(t)}</h2></div>
    <button class="close clickTarget" onclick="closeModal()">Close</button>
  </div>
  <div class="modalBody alertBody"><p>Review the requirement, then try again.</p></div>`);}

render();
