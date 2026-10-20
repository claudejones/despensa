let kalshiStage = "build",
  showBuilder = false,
  data = null,
  tab = preferences.startScreen,
  sub = "",
  plan = "",
  planTab = "tickets",
  pool = readStore("football-pool-v03", {}),
  theme = localStorage.getItem("football-theme-v03") || "light",
  tickets = readStore("football-v1", []);
const $ = (s) => document.querySelector(s),
  save = () => localStorage.setItem("football-v1", JSON.stringify(tickets)),
  money = (n) => "$" + Number(n || 0).toFixed(2),
  esc = (s) =>
    String(s ?? "").replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    ),
  dateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone:"America/Cancun",weekday:"long",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"
  }),
  dateFormatter24 = new Intl.DateTimeFormat("en-US", {
    timeZone:"America/Cancun",weekday:"long",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit",hourCycle:"h23"
  }),
  hourFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone:"America/Cancun",hour:"numeric",hourCycle:"h23"
  }),
  date = (s) => Number.isNaN(new Date(s).getTime()) ? "Invalid Date" : (preferences.timeFormat==='24'?dateFormatter24:dateFormatter).format(new Date(s));
const codes = [
    "hou",
    "jax",
    "ten",
    "ind",
    "car",
    "phi",
    "pit",
    "tb",
    "bal",
    "cle",
    "no",
    "nyg",
    "chi",
    "atl",
    "nyj",
    "ne",
    "ari",
    "lar",
    "lac",
    "kc",
    "buf",
    "lv",
    "dal",
    "gb",
    "wsh",
    "sf",
    "cin",
    "den",
    "det",
    "mia",
    "min",
    "sea",
  ],
  names = [
    "Houston Texans",
    "Jacksonville Jaguars",
    "Tennessee Titans",
    "Indianapolis Colts",
    "Carolina Panthers",
    "Philadelphia Eagles",
    "Pittsburgh Steelers",
    "Tampa Bay Buccaneers",
    "Baltimore Ravens",
    "Cleveland Browns",
    "New Orleans Saints",
    "New York Giants",
    "Chicago Bears",
    "Atlanta Falcons",
    "New York Jets",
    "New England Patriots",
    "Arizona Cardinals",
    "Los Angeles Rams",
    "Los Angeles Chargers",
    "Kansas City Chiefs",
    "Buffalo Bills",
    "Las Vegas Raiders",
    "Dallas Cowboys",
    "Green Bay Packers",
    "Washington Commanders",
    "San Francisco 49ers",
    "Cincinnati Bengals",
    "Denver Broncos",
    "Detroit Lions",
    "Miami Dolphins",
    "Minnesota Vikings",
    "Seattle Seahawks",
  ];
const teamCode = (n) => codes[names.indexOf(n)] || "NFL",
  team = (n, r) =>
    '<div class="team"><img alt="' +
    esc(n) +
    ' logo" src="assets/teams/' +
    teamCode(n) +
    '.png" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'inline-flex\'"><span class="logo-fallback">' +
    teamAbbr(n) +
    "</span><b>" +
    esc(n) +
    " (" +
    esc(record(r)) +
    ")</b></div>",
  gameHour = (s) => Number(hourFormatter.format(new Date(s))),
  gameWindow = (s) =>
    gameHour(s) < 11
      ? ["Morning", "sunrise"]
      : gameHour(s) < 15
        ? ["Afternoon", "sun"]
        : gameHour(s) < 18
          ? ["Late Afternoon", "sunset"]
          : ["Evening", "moon"],
  kickoff = (s) =>
    '<div class="kickoff-row"><span class="time-pill"><i data-lucide="' +
    gameWindow(s)[1] +
    '"></i>' +
    gameWindow(s)[0] +
    '</span><span class="muted">' +
    date(s) +
    "</span></div>";
const planNames = {
  A: "Single + Combo",
  B: "Simultaneous Games",
  C: "Staggered Games",
  D: "Undefeated Teams",
  E: "Losing-Team Streaks",
};
function hasTicketQuote(t) {
  return Number.isFinite(t.quoteSnapshot?.grossPayout) && t.quoteSnapshot.grossPayout > 0;
}
function planAmount(value) { return value == null ? '—' : money(value); }
function ticketQuoteSummary(t) {
  if (!hasTicketQuote(t)) return '<div class="soft"><strong>Ticket quote unavailable</strong><p class="muted small">$2 baseline · Individual team prices do not establish a combo payout. Review the selections; financial outcomes require a ticket quote.</p></div>';
  return '<div class="soft"><div class="row" style="justify-content:space-between"><span>Historical $' + Number(t.quoteSnapshot.stake).toFixed(2) + ' gross payout</span><b>' + money(t.quoteSnapshot.grossPayout) + '</b></div><div class="row" style="justify-content:space-between"><span>Break-even probability</span><b>' + (100*t.quoteSnapshot.stake/t.quoteSnapshot.grossPayout).toFixed(1) + '%</b></div></div>';
}
function analyzePlan(arr) {
  let stakes = arr.map((t) => Number(t.quoteSnapshot.stake)),
    total = stakes.reduce((a, b) => a + b, 0),
    keys = [...new Set(arr.flatMap((t) => t.legs.map((l) => l.gameId)))];
  if (keys.length > 18) return null;
  let outcomes = [];
  for (let mask = 0; mask < 2 ** keys.length; mask++) {
    let gross = 0,
      winners = [];
    for (let t of arr) {
      let won = t.legs.every((l) => {
        let g = data.games.find((g) => g.id === l.gameId);
        if (!g) return false;
        let teamWon = (mask & (1 << keys.indexOf(l.gameId))) !== 0;
        let pickIsAway = g.away.name === l.team;
        let selectionWon = pickIsAway ? teamWon : !teamWon;
        return l.side === "NO" ? !selectionWon : selectionWon;
      });
      if (won) {
        gross += Number(t.quoteSnapshot.grossPayout);
        winners.push(t.id);
      }
    }
    outcomes.push({ net: gross - total, winners });
  }
  let best = Math.max(...outcomes.map((x) => x.net)),
    worst = Math.min(...outcomes.map((x) => x.net));
  let shared = keys.filter(
    (id) =>
      arr.reduce((n, t) => n + Number(t.legs.some((l) => l.gameId === id)), 0) >
      1,
  );
  const priced = arr.every(hasTicketQuote);
  return { total, best: priced ? best : null, worst: priced ? worst : null, shared, keys, outcomes: priced ? outcomes : [], priced };
}
function planScreen() {
  let arr = data.comboCandidates.filter((t) => t.strategy === plan),
    a = analyzePlan(arr),
    summary =
      '<div class="card"><div class="eyebrow">PLAN ' +
      plan +
      "</div><h2>" +
      planNames[plan] +
      '</h2><p class="muted">Review these research candidates as a portfolio. No purchase recommendation is implied.</p></div><div class="grid3">' +
      [
        ["Baseline stake", a.total],
        ["Best net", a.best],
        ["Worst net", a.worst],
      ]
        .map(
          (x) =>
            '<div class="metric"><small>' +
            x[0] +
            "</small><b>" +
            planAmount(x[1]) +
            "</b></div>",
        )
        .join("") +
      '</div><div class="plan-tabs">' +
      ["tickets", "outcomes", "timing"]
        .map(
          (x) =>
            '<button data-plan-tab="' +
            x +
            '" class="' +
            (planTab === x ? "active" : "") +
            '">' +
            x[0].toUpperCase() +
            x.slice(1) +
            "</button>",
        )
        .join("") +
      "</div>";
  let ticketCards = arr
    .map(
      (t) =>
        '<div class="card" data-update-host="combos:' + esc(t.id) + '"><div class="eyebrow">TICKET ' +
        t.id +
        " · " +
        (t.legs.length === 1
          ? "SINGLE GAME BET"
          : t.legs.length + "-GAME COMBO") +
        "</div><h3>" +
        esc(t.title) +
        "</h3>" +
        t.legs
          .map((l) => {
            let g = data.games.find((g) => g.id === l.gameId);
            return (
              '<div class="leg-row">' +
              kickoff(g.kickoff) +
              team(
                l.team,
                g.away.name === l.team ? g.away.record : g.home.record,
              ) +
              '<div class="muted small">vs. ' +
              esc(g.away.name === l.team ? g.home.name : g.away.name) +
              " (" +
              esc(
                record(g.away.name === l.team ? g.home.record : g.away.record),
              ) +
              ") · " +
              l.side +
              " · Historical Kalshi " +
              (l.marketPercent ?? "—") +
              "%</div>" + (g ? marketStrip(g)+`<button class="pool-from-combo" data-pool-choose="${esc(g.id)}">Choose Pool winner for this game</button>` : "") + "</div>"
            );
          })
          .join("") +
        ticketQuoteSummary(t) + (t.researchReview ? accordion('Research review', t.researchReview.summary, '<p>' + esc(t.researchReview.pricing) + '</p><p>' + esc(t.researchReview.sharedRisk) + '</p><p>' + esc(t.researchReview.settlement) + '</p>', 'clipboard-list') : '') + '<p class="muted small">Research snapshot; verify pricing before purchase.</p><button class="primary" data-add="' +
        t.id +
        '">Add to Kalshi drafts</button></div>',
    )
    .join("");
  let outcomes =
    '<div class="card"><h3>Combined settlement outcomes</h3><p>All ' +
    a.outcomes.length +
    " possible winner combinations for " +
    a.keys.length +
    ' distinct games were evaluated, preserving shared-game dependencies.</p><div class="row" style="justify-content:space-between"><b>Best net</b><b>' +
    planAmount(a.best) +
    '</b></div><div class="row" style="justify-content:space-between"><b>Worst net</b><b>' +
    planAmount(a.worst) +
    '</b></div><p class="muted small">Scenario outcomes are not probability forecasts. Fees and early-sale execution are excluded. Win/loss paths assume a game winner; tie and void rules depend on the contract.</p>' +
    (a.priced ? scenarioTable(a) : '<p class="muted">Financial scenarios are unavailable until every ticket has a quote. Review shared exposure and timing below.</p>') +
    '</div><div class="card"><h3>Shared exposure</h3>' +
    (a.shared.length
      ? a.shared
          .map((id) => {
            let g = data.games.find((g) => g.id === id);
            return (
              "<p>" +
              esc(g.away.name) +
              " vs. " +
              esc(g.home.name) +
              " · shared by " +
              arr
                .filter((t) => t.legs.some((l) => l.gameId === id))
                .map((t) => t.id)
                .join(", ") +
              "</p>"
            );
          })
          .join("")
      : "<p>No game is shared by multiple tickets in this plan.</p>") +
    "</div>";
  if (!a.priced) outcomes = '<div class="card"><h3>Combined settlement outcomes</h3><p>Ticket quotes are not available yet. Best and worst financial outcomes will appear when every ticket is priced.</p></div>' + outcomes.slice(outcomes.indexOf('<div class="card"><h3>Shared exposure')) ;
  let timing =
    '<div class="card"><h3>Kickoff & exit checkpoints</h3>' +
    a.keys
      .map((id) => data.games.find((g) => g.id === id))
      .sort((x, y) => new Date(x.kickoff) - new Date(y.kickoff))
      .map(
        (g) =>
          '<div class="leg-row">' +
          kickoff(g.kickoff) +
          team(g.away.name, g.away.record) +
          team(g.home.name, g.home.record) +
          "</div>",
      )
      .join("") +
    '<p class="muted small">Check actual Kalshi sale offers at each checkpoint. A profitable cash-out is never guaranteed.</p></div>';
  let payout =
    '<div class="card"><h3>Plan ' +
    plan +
    " — Payout Sheet</h3>" +
    arr
      .map(
        (t) =>
          '<div class="row" style="justify-content:space-between"><span>' +
          t.id +
          " · " +
          (t.legs.length === 1 ? "Single" : "Combo") +
          "</span><b>" +
          (hasTicketQuote(t) ? money(t.quoteSnapshot.grossPayout) : "Unavailable") +
          "</b></div>",
      )
      .join("") +
    "</div>";
  return (
    '<div class="plan-backbar"><button data-plan-back="1" class="row"><i data-lucide="arrow-left"></i> All strategies</button></div>' +
    summary +
    (planTab === "tickets"
      ? ticketCards
      : planTab === "outcomes"
        ? outcomes
        : timing) +
    payout
  );
}
function builder() {
  if (!data)
    return '<div class="card">Choose a week with published games to build a ticket.</div>';
  return (
    '<div class="card"><h3>Custom ticket builder</h3><label>Ticket name<input id="buildName" placeholder="My Sunday combo"></label><label>Ticket type<select id="buildType"><option value="Single Game Bet">Single Game Bet</option><option value="Combo">Combo</option><option value="Player Prop Combo">Player Prop Combo</option></select></label><div id="buildLegs">' +
    legRow() +
    '</div><button data-builder="addLeg">+ Add game selection</button><div class="grid2"><label>Total paid ($)<input type="number" id="buildStake" min="0.01" step=".01" value="2"></label><label>Gross payout ($)<input type="number" id="buildPayout" min="0" step=".01" value="0"></label></div><div class="button-group"><button class="primary" data-builder="save">Save custom draft</button><button data-builder="cancel">Cancel</button></div><p class="muted">Player prop markets can be entered as custom selections. Enter the full amount charged by Kalshi, including any trading costs. All quotes are entered manually.</p></div>'
  );
}
function compactTeamChoice(name) {
  return `<span class="team-choice-identity"><img src="assets/teams/${teamCode(name)}.png" alt=""><b>${esc(teamAbbr(name))}</b></span>`;
}
function outcomeChoices(g, value='away', selectedTeam=null) {
 const options = selectedTeam ? [['YES',selectedTeam,'To win'],['NO',selectedTeam,'Not to win']] : [['away',g.away.name,'To win'],['home',g.home.name,'To win'],['awayNo',g.away.name,'Not to win'],['homeNo',g.home.name,'Not to win'],['prop',null,'Custom player prop']];
 return `<fieldset class="outcome-choices"><legend>Outcome</legend><input type="hidden" ${selectedTeam?'id="reviewOutcome"':'class="legSide"'} value="${value}"><div class="outcome-choice-grid">${options.map(([key,name,label])=>`<button type="button" data-outcome-choice="${key}" aria-pressed="${value===key}" aria-label="${esc(name ? name+' — '+label : label)}" class="outcome-choice ${value===key?'selected':''}">${name?compactTeamChoice(name):''}<span>${label}</span></button>`).join('')}</div></fieldset>`;
}
function legRow() {
 const opts=data.games.map(g=>`<option value="${esc(g.id)}">${esc(teamAbbr(g.away.name))} vs. ${esc(teamAbbr(g.home.name))}</option>`).join('');
 return `<div class="card build-leg"><label>Game<select class="legGame">${opts}</select></label>${outcomeChoices(data.games[0])}<label>Player prop / notes<input class="legProp" placeholder="e.g. Player 1+ touchdowns"></label><label>Kalshi %<input class="legPct" type="number" min="0" max="100" step=".1" placeholder="Optional"></label><button data-builder="removeLeg">Remove leg</button></div>`;
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-outcome-choice]');if(!b)return;
 const group=b.closest('.outcome-choices'), input=group.querySelector('input');input.value=b.dataset.outcomeChoice;
 group.querySelectorAll('[data-outcome-choice]').forEach(x=>{const on=x===b;x.classList.toggle('selected',on);x.setAttribute('aria-pressed',String(on));});
 input.dispatchEvent(new Event('change',{bubbles:true}));
});
document.addEventListener('change',e=>{
 if(!e.target.matches('.legGame'))return;
 const row=e.target.closest('.build-leg'),g=data.games.find(g=>g.id===e.target.value);
 row.querySelector('.outcome-choices').outerHTML=outcomeChoices(g);
 row.querySelector('.legPct').value='';
});
function saveCustom() {
  let name = $("#buildName")?.value.trim(),
    type = $("#buildType")?.value,
    stake = Number($("#buildStake")?.value),
    payout = Number($("#buildPayout")?.value);
  if (
    !name ||
    !Number.isFinite(stake) ||
    !Number.isFinite(payout) ||
    !(stake > 0) ||
    !(payout >= 0)
  ) {
    appAlert("Enter a name, positive stake and nonnegative payout.");
    return;
  }
  let legs = [...document.querySelectorAll(".build-leg")].map((row) => {
    let g = data.games.find(
        (g) => g.id === row.querySelector(".legGame").value,
      ),
      side = row.querySelector(".legSide").value,
      selected = side.startsWith("away") ? g.away : g.home,
      custom = side === "prop";
    return {
      gameId: g.id,
      team: custom ? "Player prop" : selected.name,
      side: custom ? "PROP" : side.endsWith("No") ? "NO" : "YES",
      marketPercent:
        row.querySelector(".legPct").value === ""
          ? null
          : Number(row.querySelector(".legPct").value),
      prop: custom ? row.querySelector(".legProp").value.trim() : null,
    };
  });
  if (
    legs.some(
      (l) =>
        (l.side === "PROP" && !l.prop) ||
        (l.marketPercent !== null &&
          (!Number.isFinite(l.marketPercent) ||
            l.marketPercent < 0 ||
            l.marketPercent > 100)),
    )
  ) {
    appAlert(
      "Enter a player prop description and valid percentages from 0 to 100.",
    );
    return;
  }
  if (!legs.length) {
    appAlert("Add at least one selection.");
    return;
  }
  if (type === "Single Game Bet" && legs.length !== 1) {
    appAlert("Single game bets require one selection.");
    return;
  }
  tickets.push({
    id: "custom-" + Date.now(),
    title: name,
    type,
    season: data.season,
    week: data.week,
    source: "My selection",
    stake,
    payout,
    market: null,
    proceeds: null,
    fee: 0,
    status: "draft",
    legs,
    events: [],
  });
  save();
  showBuilder = false;
  render();
}
let seasonMode = "weeks";
function seasonScreen() {
  let realized = tickets.reduce((sum, t) => sum + realizedNet(t), 0);
  return (
    '<div class="card"><div class="row" style="justify-content:space-between;align-items:center"><div><small>2026 NFL SEASON</small><h2>Season Overview</h2></div><button class="close-icon" data-action="calendar" aria-label="Close season overview"><i data-lucide="x"></i></button></div><div class="season-tabs"><button data-season-mode="weeks" class="' +
    (seasonMode === "weeks" ? "active" : "") +
    '">Weeks</button><button data-season-mode="summary" class="' +
    (seasonMode === "summary" ? "active" : "") +
    '">Season Summary</button></div>' +
    (seasonMode === "weeks"
      ? '<div class="season-weeks">' +
        Array.from({ length: 18 }, (_, i) => {
          let w = i + 1,
            current = w === Number($("#week").value),
            available = !!catalog.weeks?.[String(w).padStart(2, "0")];
          return (
            '<button data-week="' +
            String(w).padStart(2, "0") +
            '" class="week-card ' +
            (current ? "active" : "") +
            '"><b>Week ' +
            w +
            '</b><i data-lucide="' +
            (available
              ? "check-circle-2"
              : w < currentNFLWeek()
                ? "history"
                : "clock") +
            '"></i><span>' +
            (available
              ? "Research available"
              : w < currentNFLWeek()
                ? "Past week"
                : "Upcoming") +
            "</span></button>"
          );
        }).join("") +
        '</div>'
      : '<div class="grid2"><div class="metric"><small>Weeks with research</small><b>' +
        Object.keys(catalog.weeks || {}).length +
        '</b></div><div class="metric"><small>Selected week</small><b>' +
        Number($("#week").value) +
        '</b></div><div class="metric"><small>Realized P&L</small><b>' +
        money(realized) +
        '</b></div><div class="metric"><small>AI accuracy</small><b>—</b></div></div><p class="muted">Season-wide performance uses only recorded results. Independent AI predictions are awaiting validation.</p><button class="destination-cta" data-action="results"><span>View performance</span><i data-lucide="arrow-right"></i></button>') +
    "</div>"
  );
}
const isClosed = (t) => ["sold", "won", "lost"].includes(t.status),
  remaining = (t) =>
    t.status === "purchased" ? (t.remainingFraction ?? 1) : 0,
  events = (t) => t.events || [],
  saleProceeds = (t) =>
    events(t)
      .filter((e) => e.kind === "sale")
      .reduce((a, e) => a + Number(e.proceeds || 0), 0),
  soldFraction = (t) =>
    events(t)
      .filter((e) => e.kind === "sale")
      .reduce((a, e) => a + Number(e.portion || 0), 0),
  realizedBasis = (t) =>
    Number(t.stake || 0) * (isClosed(t) ? 1 : Math.min(1, soldFraction(t))),
  realizedProceeds = (t) =>
    isClosed(t)
      ? t.status === "sold"
        ? events(t).some((e) => e.kind === "sale")
          ? saleProceeds(t)
          : Number(t.proceeds || 0)
        : saleProceeds(t) +
          Number(
            (t.settlementProceeds ?? (events(t).length ? 0 : t.proceeds)) || 0,
          )
      : saleProceeds(t),
  realizedFees = (t) =>
    Number(t.fee || 0) * (isClosed(t) ? 1 : Math.min(1, soldFraction(t))) +
    events(t)
      .filter((e) => e.kind === "sale")
      .reduce((a, e) => a + Number(e.fee || 0), 0) +
    Number(t.settlementFee || 0),
  realizedNet = (t) => realizedProceeds(t) - realizedBasis(t) - realizedFees(t);
function ticketJournal(t) {
  return (
    '<details class="research-acc"><summary><i data-lucide="history"></i><span><b>Activity</b><div class="muted" style="font-size:12px">' +
    events(t).length +
    ' recorded events</div></span><i data-lucide="chevron-down" class="chev"></i></summary><div class="details">' +
    (events(t).length
      ? events(t)
          .map(
            (e) =>
              "<p><b>" +
              esc(e.kind) +
              "</b> · " +
              esc(e.time ? date(e.time) : "") +
              " · " +
              (e.proceeds != null
                ? money(e.proceeds)
                : e.offer != null
                  ? "Offer " + money(e.offer)
                  : "") +
              (Number(e.fee) > 0 ? " · Previously recorded cost " + money(e.fee) : "") +
              " " +
              (e.note ? esc(e.note) : "") +
              "</p>",
          )
          .join("")
      : "<p>No decisions recorded yet.</p>") +
    "</div></details>"
  );
}
let perfMode = "season";
function icons() {
  prepareDetailDrawers();
  applyPreferences();
  syncReviewUI();
  syncResearchUpdates();
  // Lucide retains data-lucide on rendered SVGs; do not replace those again.
  if (window.lucide && document.querySelector('i[data-lucide]')) {
    window.lucide.createIcons();
    document.querySelectorAll('svg[data-lucide]').forEach(svg => svg.removeAttribute('data-lucide'));
  }
}
function render() {
  captureTicketState();
  const route = [tab, sub, plan, planTab, kalshiStage, perfMode, picksView, performanceView].join(":");
  if (render.route !== route) {
    window.scrollTo(0, 0);
    render.route = route;
  }
  let v = $("#view");
  $("#status").hidden = sub === "settings";
  if(data) $("#status").textContent = "Week " + data.week + " · " + data.status + " · " + date(data.researchedAt) + " · Times in Cancún" + (data.scoresCheckedAt ? " · Scores checked " + date(data.scoresCheckedAt) : "") + (autoClosed ? " · " + autoClosed + " losing ticket(s) closed automatically — see Kalshi History" : "");
  $("#weekName").textContent = "Week " + Number($("#week").value) + " · v1.8.3";
  $("#title").textContent =
    sub === "calendar"
      ? "Season Overview"
      : sub === "settings"
        ? "Settings"
        : sub === "results"
          ? "Performance"
          : {
              weeks: "Weekly Overview",
              games: "Game Research",
              picks: picksView === "pool" ? "My Pool" : "AI Game Picks",
              combos: "Combo Strategies",
              kalshi: "My Kalshi",
            }[tab];
  $("#sectionUpdates").innerHTML = "";
  $("#sectionUpdates").dataset.updateHost = data && !sub && ["games","picks","combos"].includes(tab) ? tab : "";
  document
    .querySelectorAll("[data-tab]")
    .forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  if (sub === "calendar") {
    v.innerHTML = seasonScreen();
    icons();
    return;
  }
  if (sub === "settings") {
    v.innerHTML = settingsScreen();
    icons();
    return;
  }
  if (plan && data) {
    v.innerHTML = planScreen();
    icons();
    return;
  }
  if (sub === "results") {
    v.innerHTML = performanceTabs()+(performanceView==='ai'?paperPortfolioScreen():performanceView==='pool'?poolPerformanceScreen():performanceScreen());
    icons();
    return;
  }
  if (tab === "kalshi") {
    v.innerHTML = workspaceScreen();
    restoreTicketState();
    icons();
    return;
  }
  if (!data) {
    v.innerHTML =
      (tab==='weeks'?homePerformanceCard():'') + '<div class="card"><h2>Research not available</h2><p>Initial research planned Monday, refresh Saturday, Cancún time. Automated publication not activated.</p></div>';
    return;
  }
  if (tab === "weeks")
    v.innerHTML = homeBriefings() + homePoolCard() + homePerformanceCard() + homePaperCard() +
      '<div class="card"><div class="row" style="justify-content:space-between;align-items:center"><span><i data-lucide="wallet"></i> <b>My Kalshi portfolio</b></span><small>Week ' +
      data.week +
      '</small></div><p class="muted">' +
      money(scopeTickets().reduce((n, t) => n + basis(t), 0)) +
      " open exposure · " +
      scopeTickets().filter((t) => t.status === "purchased").length +
      " purchased positions recorded · " +
      scopeTickets().filter((t) => ["sold", "won", "lost"].includes(t.status))
        .length +
      ' closed</p><div class="grid2"><button data-tab="kalshi">Review tickets</button><button data-open-pool>My Pool</button></div></div>';
  if (tab === "games")
    v.innerHTML = data.games.map(researchGame).join("");
  if (tab === "picks") v.innerHTML = picksScreen();
  if (tab === "combos")
    v.innerHTML =
      '<div class="soft" style="margin-bottom:13px"><b>Five portfolio strategies</b><p class="muted">Compare objectives, tickets, shared exposure and historical payouts. Research candidates, not live trade recommendations.</p></div>' +
      Object.entries({
        A: [
          "Single + Combo",
          "Pair a single-game position with a related combo.",
          "git-branch",
        ],
        B: [
          "Simultaneous Games",
          "Group selections settling in the same window.",
          "clock-3",
        ],
        C: [
          "Staggered Games",
          "Sequence games for potential cash-out checkpoints.",
          "calendar-range",
        ],
        D: [
          "Undefeated Teams",
          "Evaluate whether unbeaten teams continue their streak.",
          "trophy",
        ],
        E: [
          "Losing-Team Streaks",
          "Evaluate NO positions against struggling teams.",
          "trending-down",
        ],
      })
        .map(
          ([id, info]) =>
            '<button class="card" style="width:100%;text-align:left" data-plan="' +
            id +
            '"><div class="row"><i data-lucide="' +
            info[2] +
            '"></i><span style="flex:1;min-width:0"><span class="eyebrow">PLAN ' +
            id +
            '</span><h3 style="margin:3px 0">' +
            info[0] +
            '</h3><span class="muted" style="font-size:12px">' +
            info[1] +
            '</span><div style="margin-top:7px;font-size:12px;font-weight:700">' +
            data.comboCandidates.filter((t) => t.strategy === id).length +
            ' candidate tickets · View strategy details</div></span><i data-lucide="chevron-right"></i></div></button>',
        )
        .join("");
  if (tab === "results") {
    let c = tickets.filter((t) => ["won", "lost", "sold"].includes(t.status)),
      cost = c.reduce((a, t) => a + Number(t.stake), 0),
      returnValue = c.reduce((a, t) => a + Number(t.proceeds || 0), 0);
    v.innerHTML =
      '<div class="grid"><div class="card">Realized net<h2>' +
      money(returnValue - cost) +
      '</h2></div><div class="card">ROI<h2>' +
      (cost ? (((returnValue - cost) / cost) * 100).toFixed(1) + "%" : "—") +
      '</h2></div><div class="card">Closed<h2>' +
      c.length +
      '</h2></div><div class="card">Open stake<h2>' +
      money(
        tickets
          .filter((t) => t.status === "purchased")
          .reduce((a, t) => a + Number(t.stake), 0),
      ) +
      "</h2></div></div>";
  }
  applyPreferences();
}
let loadSequence = 0;
async function load() {
  const request = ++loadSequence,
    week = $("#week").value;
  data = null;
  autoClosed = 0;
  researchChanges={snapshot:{},unread:{}};
  render();
  try {
    if (!catalog.loaded) {
      try {
        const r = await fetch("data/manifest.json", { cache: "no-store" });
        catalog = { ...(await r.json()), loaded: true };
      } catch {
        catalog = { weeks: {}, loaded: true };
      }
    }
    const r = await fetch("data/2026/week-" + week + ".json?" + Date.now(), {
      cache: "no-store",
    });
    if (!r.ok) throw Error("not found");
    const next = await r.json();
    if (request !== loadSequence) return;
    if (
      !Array.isArray(next.games) ||
      !Array.isArray(next.comboCandidates) ||
      Number(next.week) !== Number(week)
    )
      throw Error("Invalid week data");
    data = next;
    rememberPoolResearch(data);
    autoClosed = reconcileFinalLosses(data);
    trackResearchChanges(data);
    data.games.sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
    pool = readStore("football-pool-v03", pool);
    let poolMigrated = false;
    for (const g of data.games) {
      const old = data.week + "-" + g.id,
        k = data.season + "-" + old;
      if (!(k in pool) && old in pool) { pool[k] = pool[old]; poolMigrated = true; }
    }
    if (poolMigrated) localStorage.setItem("football-pool-v03", JSON.stringify(pool));
    $("#status").textContent =
      "Week " + data.week + " · " + data.status + " · " + date(data.researchedAt) + " · Times in Cancún" + (data.scoresCheckedAt ? " · Scores checked " + date(data.scoresCheckedAt) : "") + (autoClosed ? " · " + autoClosed + " losing ticket(s) closed automatically — see Kalshi History" : "");
  } catch (e) {
    if (request !== loadSequence) return;
    data = null;
    $("#status").textContent =
      "Week " + Number(week) + " · Research not yet published";
  }
  render();
  icons();
}
function exportData() {
  let a = document.createElement("a"),
    u = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            {
              schemaVersion: 1,
              tickets,
              bankroll: funding,
              learning,
              officePool: pool,
              preferences,
              selectedWeek: $("#week").value,
              exportedAt: new Date().toISOString(),
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
  a.href = u;
  a.download = "football-chatgpt-export.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
document.addEventListener("click", async (e) => {
  let b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.tab) {
    tab = b.dataset.tab;
    sub = "";
    plan = "";
    render();
    icons();
    window.scrollTo({top:0,left:0,behavior:"instant"});
  }
  if (b.dataset.action === "calendar") {
    sub = sub === "calendar" ? "" : "calendar";
    plan = "";
    seasonMode = "weeks";
    render();
  }
  if (b.dataset.action === "settingsExport") {
    exportData();
    return;
  }
  if (b.dataset.action === "settings") {
    sub = sub === "settings" ? "" : "settings";
    plan = "";
    render();
  }
  if (b.dataset.action === "results") {
    sub = "results";
    plan = "";
    render();
    if(performanceView === "pool") loadPoolResults();
    if(performanceView === "ai") loadPaperPortfolio();
  }
  if (b.dataset.week) {
    $("#week").value = b.dataset.week;
    localStorage.setItem("football-selected-week-2026", b.dataset.week);
    sub = "";
    plan = "";
    load();
  }
  if (b.dataset.theme) {
    theme = b.dataset.theme;
    localStorage.setItem("football-theme-v03", theme);
    render();
  }
  if (b.dataset.seasonMode) {
    seasonMode = b.dataset.seasonMode;
    render();
  }
  if (b.dataset.perfMode) {
    perfMode = b.dataset.perfMode;
    render();
  }
  if (b.dataset.kalshiStage) {
    kalshiStage = b.dataset.kalshiStage;
    render();
  }
  if (b.dataset.plan) {
    plan = b.dataset.plan;
    planTab = "tickets";
    render();
  }
  if (b.dataset.planBack) {
    plan = "";
    render();
  }
  if (b.dataset.planTab) {
    planTab = b.dataset.planTab;
    render();
  }
  if (b.dataset.add) addCandidateReview(b);
  if (b.dataset.pool) {
    const g=data.games.find(g=>g.id===b.dataset.pool);
    if(g)setPoolChoice(g.id,poolChoice(g)===b.dataset.team?null:b.dataset.team);
  }
  if (b.dataset.action === "copyPool") {
    let chosen = data.games.filter(
      (g) => pool[data.season + "-" + data.week + "-" + g.id],
    );
    if (!chosen.length) return appAlert("Select a team first.");
    if (
      chosen.length < data.games.length &&
      !await appConfirm(
        chosen.length +
          " of " +
          data.games.length +
          " games selected — copy anyway?",
      )
    )
      return;
    let lines = chosen.map((g, i) => {
      let n = pool[data.season + "-" + data.week + "-" + g.id],
        w = g.away.name === n ? g.away : g.home,
        o = g.away.name === n ? g.home : g.away;
      return (
        i +
        1 +
        ". WINNER: " +
        w.name +
        " (" +
        record(w.record) +
        ")\n   Opponent: " +
        o.name +
        " (" +
        record(o.record) +
        ")\n   " +
        date(g.kickoff)
      );
    });
    let txt =
      "NFL Office Pool — 2026 Week " +
      data.week +
      "\n\nMY PICKS TO WIN:\n\n" +
      lines.join("\n\n") +
      "\n\nTotal selections: " +
      chosen.length +
      " of " +
      data.games.length;
    navigator.clipboard
      .writeText(txt)
      .then(() => appAlert("Copied"))
      .catch(() => appCopyFallback(txt));
  }
  if (b.id === "custom") {
    showBuilder = !showBuilder;
    render();
    if (showBuilder) $("#buildLegs").innerHTML = legRow();
  }
  if (b.dataset.builder === "addLeg")
    $("#buildLegs").insertAdjacentHTML("beforeend", legRow());
  if (b.dataset.builder === "removeLeg") b.closest(".build-leg").remove();
  if (b.dataset.builder === "save") saveCustom();
  if (b.dataset.builder === "cancel") {
    showBuilder = false;
    render();
  }
  if (b.id === "export") exportData();
  if (b.dataset.settle) {
    let t = tickets.find((x) => x.id === b.dataset.settle);
    if (!t || t.status !== "purchased") return;
    let p = document.getElementById("settle-" + t.id)?.value,
      amount = Number(p);
    if (
      p === "" ||
      !Number.isFinite(amount) ||
      amount < 0
    )
      return appAlert("Enter a valid final amount received.");
    if (!await appConfirm("Record final settlement and close remaining position?"))
      return;
    t.events ??= [];
    t.events.push({
      kind: "settlement",
      time: new Date().toISOString(),
      proceeds: amount,
      fee: 0,
      proceedsAreNet: true,
      portion: t.remainingFraction ?? 1,
    });
    t.settlementProceeds = amount;
    // Legacy settlementFee values remain readable; new settlements have no fee.
    t.remainingFraction = 0;
    t.status = amount > 0 ? "won" : "lost";
    closeReviewSheet();
    save();
    render();
  }
  if (b.dataset.sale) {
    let t = tickets.find((x) => x.id === b.dataset.sale);
    if (!t || t.status !== "purchased") return;
    let pct = Number(document.getElementById("qty-" + t.id)?.value),
      raw = document.getElementById("sale-" + t.id)?.value,
      amount = Number(raw);
    if (
      !(pct > 0 && pct <= 100) ||
      raw === "" ||
      !Number.isFinite(amount) ||
      amount < 0 ||
      !await appConfirm(
        "Record an executed sale of " + pct + "% for " + money(amount) + "?",
      )
    )
      return;
    let remaining = t.remainingFraction ?? 1,
      portion = (remaining * pct) / 100;
    t.events ??= [];
    t.events.push({
      kind: "sale",
      time: new Date().toISOString(),
      portion,
      proceeds: amount,
      fee: 0,
      proceedsAreNet: true,
    });
    t.proceeds = (Number(t.proceeds) || 0) + amount;
    t.remainingFraction = Math.max(0, remaining - portion);
    if (t.remainingFraction < 0.000001) t.status = "sold";
    closeReviewSheet();
    save();
    render();
  }
  if (b.dataset.del) {
    if (tickets.find((t) => t.id === b.dataset.del)?.status !== "draft") return;
    tickets = tickets.filter((t) => t.id !== b.dataset.del);
    closeReviewSheet();
    save();
    render();
  }
});
document.addEventListener("change", async (e) => {
  if (e.target.id === "week") {
    localStorage.setItem("football-selected-week-2026", e.target.value);
    load();
  }
  if (e.target.id === "swipePref")
    localStorage.setItem("football-swipe-v04", e.target.checked ? "on" : "off");
  if (e.target.dataset.id) {
    let t = tickets.find((x) => x.id === e.target.dataset.id),
      field = e.target.dataset.field;
    if (!t || !["status","stake","payout","fee","market","proceeds"].includes(field)) return;
    let value = e.target.value;
    if (field === "status") {
      if (value === "purchased" && t.status === "draft") {
        if (!(Number(t.stake) > 0 && Number(t.payout) > 0)) {
          appAlert(
            "Enter a valid stake and gross payout before recording purchase.",
          );
          render();
          return;
        }
        t.events ??= [];
        t.events.push({
          kind: "purchase",
          time: new Date().toISOString(),
          stake: Number(t.stake),
          payout: Number(t.payout),
        });
        freezeTicketPricing(t);
        t.remainingFraction = 1;
      } else if (t.status === "draft" && value !== "draft") {
        appAlert("Record purchase first.");
        render();
        return;
      } else if (
        t.status === "purchased" &&
        value === "sold" &&
        (t.remainingFraction ?? 1) > 0
      ) {
        appAlert("Record an executed sale to close this position.");
        render();
        return;
      }
      if (
        value !== t.status &&
        !(t.status === "draft" && value === "purchased")
      ) {
        appAlert(
          "Use executed sale or final settlement to close a purchased position.",
        );
        render();
        return;
      }
      t.status = value;
    } else {
      let n = value === "" ? null : Number(value);
      if (n !== null && (!Number.isFinite(n) || n < 0 || (field === "market" && n > 100))) {
        e.target.setCustomValidity(field === "market" ? "Enter a percentage from 0 to 100." : "Enter a valid nonnegative amount.");
        e.target.reportValidity();
        return;
      }
      if (
        t.status !== "draft" &&
        ["stake", "payout", "fee", "market", "proceeds"].includes(field)
      ) {
        appAlert("Original purchased terms cannot be changed.");
        render();
        return;
      }
      e.target.setCustomValidity("");
      // Editing the all-in amount folds any legacy draft cost into that amount.
      if (field === "stake") t.fee = 0;
      t[field] = n;
    }
    save();
    if(field !== "status") { updateTicketPricing(t); return; }
    render();
  }
  if (e.target.id === "settingsImport") {
    try {
      let file = e.target.files?.[0];
      if (!file) return;
      let backup = JSON.parse(await file.text());
      if (backup.schemaVersion !== 1 || !Array.isArray(backup.tickets))
        throw Error("Invalid backup format");
      validateBackup(backup);
      const importedPreferences=backup.preferences===undefined?preferences:validatedPreferences(backup.preferences);
      if (
        !await appConfirm(
          "Replace locally stored ticket records and office-pool selections with this backup?",
        )
      )
        return;
      preferences=importedPreferences;savePreferences();
      tickets = backup.tickets;
      funding = backup.bankroll || [];
      learning = backup.learning || {};
      persistExtras();
      save();
      if (
        backup.officePool &&
        typeof backup.officePool === "object" &&
        !Array.isArray(backup.officePool)
      ) {
        pool = backup.officePool;
        localStorage.setItem("football-pool-v03", JSON.stringify(pool));
      }
      if (/^(0[1-9]|1[0-8])$/.test(backup.selectedWeek || "")) {
        localStorage.setItem(
          "football-selected-week-2026",
          backup.selectedWeek,
        );
        $("#week").value = backup.selectedWeek;
        await load();
      } else render();
    } catch (err) {
      appAlert("Import failed: " + err.message);
    }
    return;
  }
  if (e.target.id === "import") {
    try {
      let x = JSON.parse(await e.target.files[0].text());
      if (x.schemaVersion !== 1 || !Array.isArray(x.tickets))
        throw Error("Invalid backup");
      if (await appConfirm("Replace local ticket records?")) {
        validateBackup(x);
        tickets = x.tickets;
        save();
        render();
      }
    } catch (err) {
      appAlert(err.message);
    }
  }
});
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('pageshow', () => window.scrollTo({top:0,left:0,behavior:'instant'}));
window.addEventListener("load", icons);
let savedWeek = localStorage.getItem("football-selected-week-2026");
$("#week").value = /^(0[1-9]|1[0-8])$/.test(savedWeek || "")
  ? savedWeek
  : String(currentNFLWeek()).padStart(2, "0");
load();
