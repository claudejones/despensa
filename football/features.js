let catalog = { weeks: {}, loaded: false };
function currentNFLWeek() {
  return Math.max(
    1,
    Math.min(
      18,
      1 +
        Math.floor(
          (Date.now() - Date.parse("2026-09-10T00:00:00-05:00")) / 604800000,
        ),
    ),
  );
}
/* UI completion. Existing ledger and office-pool storage keys remain stable. */
function readStore(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
let funding = readStore("football-bankroll-v1", []),
  learning = readStore("football-learning-v1", {});
const persistExtras = () => {
  localStorage.setItem("football-bankroll-v1", JSON.stringify(funding));
  localStorage.setItem("football-learning-v1", JSON.stringify(learning));
};
function record(r) {
  return /^\d+-\d+$/.test(r || "") ? r + "-0" : r || "—";
}
function teamAbbr(n) {
  return teamCode(n) === "wsh" ? "WAS" : teamCode(n).toUpperCase();
}
function weekOf(t) {
  return Number(t.week || 6);
}
function scopeTickets() {
  return tickets.filter((t) => weekOf(t) === Number($("#week").value));
}
function basis(t) {
  return (Number(t.stake || 0) + Number(t.fee || 0)) * remaining(t);
}
function metric(label, value) {
  return `<div class="metric"><small>${label}</small><b>${value}</b></div>`;
}
function accordion(
  title,
  summary,
  body,
  icon = "clipboard-list",
  open = false,
) {
  return `<details class="research-acc" ${["Why this selection?","Research review"].includes(title)?'data-research-detail':''} ${open ? "open" : ""}><summary><i data-lucide="${icon}"></i><span><b>${title}</b><div class="muted small">${summary}</div></span><i class="chev" data-lucide="chevron-down"></i></summary><div class="details">${body}</div></details>`;
}
function validateBackup(x) {
  if (!Array.isArray(x.tickets)) throw Error("Tickets must be an array");
  const ids = new Set();
  for (const t of x.tickets) {
    if (
      !/^[a-zA-Z0-9_.:-]+$/.test(t.id || "") ||
      ids.has(t.id) ||
      !["draft", "purchased", "sold", "won", "lost"].includes(t.status)
    )
      throw Error("Invalid or duplicate ticket");
    ids.add(t.id);
    for (const k of [
      "stake",
      "payout",
      "fee",
      "proceeds",
      "settlementProceeds",
      "settlementFee",
    ])
      if (t[k] != null && (!Number.isFinite(Number(t[k])) || Number(t[k]) < 0))
        throw Error("Invalid ticket amounts");
    if (
      t.remainingFraction != null &&
      (t.remainingFraction < 0 || t.remainingFraction > 1)
    )
      throw Error("Invalid remaining quantity");
    if (t.legs != null && !Array.isArray(t.legs)) throw Error("Invalid legs");
    for(const l of t.legs||[]) if(l.quotedPercent!=null&&(!Number.isFinite(l.quotedPercent)||l.quotedPercent<0||l.quotedPercent>100)) throw Error("Invalid leg quote");
    if(t.pricingSnapshot!=null&&(!Array.isArray(t.pricingSnapshot.legs)||t.pricingSnapshot.legs.some(l=>l.quote!=null&&(!Number.isFinite(l.quote.value)||l.quote.value<0||l.quote.value>1)))) throw Error("Invalid locked quote snapshot");
    if (t.events != null && !Array.isArray(t.events))
      throw Error("Invalid event history");
  }
  if (
    x.bankroll != null &&
    (!Array.isArray(x.bankroll) ||
      x.bankroll.some((e) => !Number.isFinite(e.amount)))
  )
    throw Error("Invalid bankroll transfers");
}
function exposureView(rows) {
  const priced = rows.filter((t) => Number(t.payout) > 0 && t.legs?.length),
    keys = [...new Set(priced.flatMap((t) => t.legs.map((l) => l.gameId)))];
  let html =
    '<h3>Portfolio evaluation</h3><p class="muted small">Potential results for the remaining bets below, including shared game outcomes.</p>';
  const eligible =
    priced.length &&
    keys.length <= 16 &&
    priced.every((t) =>
      t.legs.every(
        (l) => l.side !== "PROP" && data?.games.some((g) => g.id === l.gameId),
      ),
    );
  if (eligible) {
    let adjusted = priced.map((t) => ({
      ...t,
      quoteSnapshot: {
        stake:
          (Number(t.stake || 0) + Number(t.fee || 0)) *
          (t.status === "purchased" ? remaining(t) : 1),
        grossPayout:
          Number(t.payout) * (t.status === "purchased" ? remaining(t) : 1),
      },
    }));
    let a = analyzePlan(adjusted);
    html +=
      '<div class="grid2">' +
      metric("Best-case profit", money(a.best)) +
      metric("Worst-case result", money(a.worst)) +
      '</div><p class="small muted">' +
      a.outcomes.length +
      " outcomes · After entry fees, before future sale fees. Assumes each game has a winner; ties and voids follow market rules.</p>";
  } else
    html +=
      '<p class="muted">Exact joint outcomes require priced game-winner legs from this week. Player props require their own joint probability model.</p>';
  html += `<p class="small muted">${rows.length} ${rows.length===1?'ticket':'tickets'} below · ${priced.length} priced${rows.length>priced.length?` · ${rows.length-priced.length} awaiting payout details`:''}</p>`;
  return '<div class="card">' + html + "</div>";
}
function workspaceScreen() {
  const rows = scopeTickets(),
    drafts = rows.filter((t) => t.status === "draft"),
    opened = rows.filter((t) => t.status === "purchased"),
    closed = rows.filter(isClosed),
    shown =
      kalshiStage === "build"
        ? drafts
        : kalshiStage === "evaluate"
          ? [...drafts, ...opened]
          : kalshiStage === "monitor"
            ? opened
            : closed;
  return `<div class="grid3">${metric("Draft stake", money(drafts.reduce((n, t) => n + Number(t.stake || 0), 0)))}${metric("Amount at risk", money(opened.reduce((n, t) => n + basis(t), 0)))}${metric("Realized P&L", money(rows.reduce((n, t) => n + realizedNet(t), 0)))}</div>${workspaceSteps()}${kalshiStage === "build" ? `<div class="card"><h3>Build your tickets</h3><p class="muted small">Add selections while reading Games, AI Picks or Combos. Build singles or numbered combos as you research, then review selections and pricing here.</p><div class="grid2"><button class="primary" data-tab="games">Find picks in Games</button><button id="custom">Manual ticket / prop</button></div></div>${showBuilder ? builder() : ""}` : ""}${kalshiStage === "build" ? reviewCombineBar(drafts) : ""}${kalshiStage === "evaluate" ? exposureView(shown) : ""}${kalshiStage === "close" ? `<div class="card"><h3>Week ${Number($("#week").value)} closeout</h3><p class="muted">${opened.length ? opened.length + " open positions still need a recorded sale or settlement." : "All purchased positions are closed."}</p><div class="button-group"><button data-close-week ${opened.length ? "disabled" : ""}>Save weekly review</button><button id="export">Export for ChatGPT</button></div></div>` : ""}${shown.length ? shown.map(ticketView).join("") : `<div class="card empty"><i data-lucide="${kalshiStage === "monitor" ? "activity" : "inbox"}"></i><h3>${{ build: "No draft tickets", evaluate: "No tickets to evaluate", monitor: "No open positions", close: "No closed tickets" }[kalshiStage]}</h3><p class="muted">Week ${Number($("#week").value)} · Your records stay saved when you switch weeks.</p></div>`}`;
}
function performanceScreen() {
  const rows = (perfMode === "season" ? tickets : scopeTickets()).filter(
      (t) => t.status !== "draft",
    ),
    cost = rows.reduce((n, t) => n + realizedBasis(t), 0),
    net = rows.reduce((n, t) => n + realizedNet(t), 0),
    proceeds = rows.reduce((n, t) => n + realizedProceeds(t), 0),
    open = rows.reduce((n, t) => n + basis(t), 0),
    allOpen = tickets.reduce((n, t) => n + basis(t), 0),
    allNet = tickets.reduce((n, t) => n + realizedNet(t), 0),
    funds = funding.reduce((n, e) => n + e.amount, 0);
  const groups = [
    ...Object.keys(planNames).map((k) => [
      "Plan " + k,
      rows.filter(
        (t) => (t.strategy || t.source?.match(/^AI ([A-E])/i)?.[1]) === k,
      ),
    ]),
    ["Singles", rows.filter((t) => t.legs?.length === 1)],
    ["Combos", rows.filter((t) => t.legs?.length > 1)],
  ];
  const table = groups
    .map(([name, ts]) => {
      let c = ts.reduce((n, t) => n + realizedBasis(t), 0),
        p = ts.reduce((n, t) => n + realizedNet(t), 0);
      return `<tr><td>${name}</td><td>${ts.length}</td><td>${money(p)}</td><td>${c ? ((p / c) * 100).toFixed(1) + "%" : "—"}</td></tr>`;
    })
    .join("");
  const weekly = Array.from({ length: 18 }, (_, i) => ({
    w: i + 1,
    n: rows
      .filter((t) => weekOf(t) === i + 1)
      .reduce((n, t) => n + realizedNet(t), 0),
  }));
  let cumulative = 0;
  const history = weekly
    .filter((x) => rows.some((t) => weekOf(t) === x.w))
    .map((x) => {
      cumulative += x.n;
      return `<tr><td>Week ${x.w}</td><td>${money(x.n)}</td><td>${money(cumulative)}</td></tr>`;
    })
    .join("");
  return `<div class="plan-tabs"><button data-perf-mode="season" class="${perfMode === "season" ? "active" : ""}">Season</button><button data-perf-mode="week" class="${perfMode === "week" ? "active" : ""}">Selected Week</button></div><div class="card"><div class="eyebrow">${perfMode === "season" ? "2026 SEASON" : "WEEK " + Number($("#week").value)} · REALIZED P&L</div><h2 class="hero-number">${money(net)}</h2><p class="muted">${cost ? ((100 * net) / cost).toFixed(1) + "% ROI" : "ROI available after a realized result"} · after recorded fees</p></div><div class="grid2">${metric("Realized cost basis", money(cost))}${metric("Realized proceeds", money(proceeds))}${metric("Open exposure", money(open))}${metric("Closed tickets", rows.filter(isClosed).length)}</div>${accordion("Bankroll", "Season cash and funded capital", `<div class="grid2">${metric("Net deposits", money(funds))}${metric("Cash available", funding.length ? money(funds + allNet - allOpen) : "—")}</div><p class="muted small">Cash = net deposits + realized P&L − remaining cost basis. Set your opening funding before interpreting the balance.</p><div class="grid2"><label>Transfer type<select id="fundType"><option value="1">Deposit / opening balance</option><option value="-1">Withdrawal</option></select></label><label>Amount ($)<input id="fundAmount" type="number" min=".01" step=".01"></label></div><button data-fund>Record transfer</button>`, "wallet")}${accordion("Trading Performance", "Strategy comparisons · singles and combos", `<div class="table-scroll"><table><thead><tr><th>Strategy</th><th>Tickets</th><th>Net</th><th>ROI</th></tr></thead><tbody>${table}</tbody></table></div>`, "layers", true)}${accordion("Weekly Results", "Weekly and cumulative realized returns", history ? weeklyChart(rows) + `<table><thead><tr><th>Week</th><th>Net</th><th>Cumulative</th></tr></thead><tbody>${history}</tbody></table>` : '<p class="muted">No recorded results yet.</p>', "chart-no-axes-combined")}${accordion("Historical Learning", "Weekly notes and recorded decisions", `<label>Week ${Number($("#week").value)} review<textarea id="learningNote" rows="4">${esc(learning[$("#week").value]?.note || "")}</textarea></label><div class="button-group"><button data-save-learning>Save review</button><button id="export">Export history</button></div>${rows.map((t) => `<p><b>${esc(t.title)}</b> · ${events(t).length} events</p>`).join("")}`, "history")}`;
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.purchase) {
    const t = tickets.find((t) => t.id === b.dataset.purchase);
    if (!t || t.status !== "draft") return;
    const invalid=[...b.closest(".ticket").querySelectorAll("input[data-field],input[data-leg-quote]")].find(input=>!input.validity.valid);
    if(invalid){invalid.reportValidity();return;}
    if (t.type === "Combo" && t.legs.length < 2) return appAlert("Add at least two selections to this combo before recording purchase.");
    if (!(Number(t.stake) > 0 && Number(t.payout) > 0))
      return appAlert("Enter positive stake and gross payout first.");
    freezeTicketPricing(t);
    t.status = "purchased";
    t.remainingFraction = 1;
    t.events ??= [];
    t.events.push({
      kind: "purchase",
      time: new Date().toISOString(),
      stake: t.stake,
      payout: t.payout,
      fee: t.fee || 0,
    });
    save();
    kalshiStage = "monitor";
    render();
  }
  if (b.dataset.observe) {
    const t = tickets.find((t) => t.id === b.dataset.observe),
      raw = document.getElementById("offer-" + t.id).value,
      n = Number(raw);
    if (raw === "" || !Number.isFinite(n) || n < 0)
      return appAlert("Enter a valid observed offer.");
    t.events ??= [];
    t.events.push({
      kind: "observation",
      time: new Date().toISOString(),
      offer: n,
      note:
        document.getElementById("decision-" + t.id).value +
        ": " +
        document.getElementById("note-" + t.id).value,
    });
    closeReviewSheet();
    save();
    render();
  }
  if (b.hasAttribute("data-fund")) {
    const n = Number($("#fundAmount").value);
    if (!Number.isFinite(n) || n <= 0)
      return appAlert("Enter a positive transfer amount.");
    funding.push({
      time: new Date().toISOString(),
      amount: n * Number($("#fundType").value),
    });
    persistExtras();
    render();
  }
  if (
    b.hasAttribute("data-save-learning") ||
    b.hasAttribute("data-close-week")
  ) {
    const k = $("#week").value;
    learning[k] = {
      ...learning[k],
      note: $("#learningNote")?.value || learning[k]?.note || "",
      updatedAt: new Date().toISOString(),
      ...(b.hasAttribute("data-close-week")
        ? { closedAt: new Date().toISOString() }
        : {}),
    };
    persistExtras();
    appAlert("Weekly review saved.");
  }
});
function researchSources(ids) {
  return (
    '<p class="small">' +
    (data.sources || [])
      .filter((s) => (!ids || ids.includes(s.id)) && /^https:\/\//.test(s.url))
      .map(
        (s) =>
          `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`,
      )
      .join(" · ") +
    "</p>"
  );
}
function scenarioTable(a) {
  const groups = new Map();
  for (const o of a.outcomes) {
    const k = o.winners.join(", ") || "None";
    const old = groups.get(k);
    groups.set(k, { net: o.net, count: (old?.count || 0) + 1 });
  }
  return (
    "<table><thead><tr><th>Winning tickets</th><th>Paths</th><th>Net</th></tr></thead><tbody>" +
    [...groups]
      .sort((a, b) => b[1].net - a[1].net)
      .map(
        ([k, o]) =>
          `<tr><td>${esc(k)}</td><td>${o.count}</td><td>${money(o.net)}</td></tr>`,
      )
      .join("") +
    "</tbody></table>"
  );
}
function forecast(g) {
  return (data?.predictions || []).find(
    (p) =>
      p.gameId === g.id &&
      p.validated === true &&
      p.frozenAt &&
      new Date(p.frozenAt) < new Date(g.kickoff) &&
      [g.away.name, g.home.name].includes(p.winner) &&
      Number.isFinite(p.probability) &&
      p.probability >= 0 &&
      p.probability <= 1,
  );
}
function researchLean(g) {
  return (data?.predictions || []).find(p => p.gameId === g.id && p.kind === 'qualitative-research-lean' && p.researchReviewed === true && p.frozenAt && new Date(p.frozenAt) < new Date(g.kickoff) && [g.away.name,g.home.name].includes(p.winner));
}
function aiAnalysisScreen() {
  const validated = data.games.filter(forecast).length;
  return (
    `<div class="card"><h3>Independent AI Predictions</h3><p class="muted">${validated ? validated + " validated forecasts published." : data.games.filter(researchLean).length + " qualitative research leans published; win probabilities are not calibrated."} Your office-pool selections stay independent.</p></div>` +
    data.games
      .map((g) => {
        let validatedForecast = forecast(g), p = validatedForecast || researchLean(g);
        const details = p
          ? `<p class="small muted">Pick recorded ${esc(date(p.frozenAt))} · Confidence: ${esc(p.confidence || "Not supplied")}</p><b>Supporting evidence</b><ul>${(p.supportingEvidence || []).map((x) => "<li>" + esc(x) + "</li>").join("")}</ul><b>Opposing evidence</b><ul>${(p.opposingEvidence || []).map((x) => "<li>" + esc(x) + "</li>").join("")}</ul>`
          : "<ul>" +
            g.insights
              .flatMap((i) => i.details)
              .filter((x) => !x.includes("No verified"))
              .map((x) => "<li>" + esc(x) + "</li>")
              .join("") +
            '</ul><p class="muted small">Research context only; no validated forecast.</p>';
        return `<article class="card pick-card" data-update-host="picks:${esc(g.id)}">${kickoff(g.kickoff)}${team(g.away.name, g.away.record)}${team(g.home.name, g.home.record)}${marketStrip(g)}<div class="divider"></div><div class="grid2"><div><small>${validatedForecast ? "AI PREDICTED WINNER" : "AI RESEARCH LEAN"}</small><div><b>${p ? esc(p.winner) : "Pending validation"}</b></div></div><div><small>AI WIN PROBABILITY</small><div><b>${validatedForecast ? (100 * p.probability).toFixed(1) + "%" : "Not published"}</b></div></div></div>${accordion("Why this selection?", p ? esc(p.summary || "Evidence behind this forecast") : "Research available; forecast pending.", details + sourceDisclosure(p?.sourceIds || g.sourceIds), "brain")}${reviewActions(g)}</article>`;
      })
      .join("")
  );
}
function weeklyChart(rows = tickets) {
  const points = Array.from({ length: 18 }, (_, i) =>
    rows
      .filter((t) => weekOf(t) === i + 1)
      .reduce((n, t) => n + realizedNet(t), 0),
  );
  let total = 0;
  const cumulative = points.map((x) => (total += x)),
    range = Math.max(1, ...points.map(Math.abs), ...cumulative.map(Math.abs)),
    y = (v) => 70 - (v / range) * 55;
  return `<figure class="weekly-chart"><figcaption class="small muted">Weekly P&L bars · cumulative line · Weeks 1–18</figcaption><svg viewBox="0 0 320 145" role="img" aria-label="Weekly and cumulative realized profit and loss"><line x1="8" y1="70" x2="312" y2="70" stroke="#b6c8d4"/>${points.map((n, i) => `<rect x="${i * 17 + 8}" y="${Math.min(y(n), 70)}" width="10" height="${Math.max(1, Math.abs(y(n) - 70))}" rx="2" fill="${n < 0 ? "#b64b58" : "#167f84"}"><title>Week ${i + 1}: ${money(n)}</title></rect>`).join("")}<polyline fill="none" stroke="#19334b" stroke-width="2" points="${cumulative.map((n, i) => i * 17 + 13 + "," + y(n)).join(" ")}"/><text x="8" y="140" fill="#50677b" font-size="10">Week 1</text><text x="270" y="140" fill="#50677b" font-size="10">Week 18</text></svg></figure>`;
}

function picksScreen(){return poolTabs()+(picksView==='pool'?myPoolScreen():aiAnalysisScreen());}

function workspaceSteps() {
 const views=[['build','Drafts'],['evaluate','Analysis'],['monitor','Open bets'],['close','History']];
 return `<div role="navigation" class="workspace-tabs" aria-label="Kalshi views">${views.map(([key,label])=>`<button data-kalshi-stage="${key}" class="${kalshiStage===key?'active':''}" ${kalshiStage===key?'aria-current="page"':''}>${label}</button>`).join('')}</div><button class="destination-cta workspace-performance" data-action="results">View performance <i data-lucide="arrow-right"></i></button>`;
}
