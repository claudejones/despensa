// Contextual shortlisting uses the existing draft ledger; office-pool picks stay separate.
const comboSelection = new Set();
function singleInReview(gameId, name) {
  return scopeTickets().some(
    (t) =>
      t.status === "draft" &&
      t.legs?.length === 1 &&
      t.legs[0].gameId === gameId &&
      t.legs[0].team === name &&
      t.legs[0].side === "YES",
  );
}
function reviewActions(g) {
 const chosen=poolChoice(g);
 return `<div class="context-review direct-pick-actions" data-game="${esc(g.id)}"><button data-pool-choose="${esc(g.id)}"><i data-lucide="clipboard-list"></i> Pick for My Pool</button><button data-kalshi-choose="${esc(g.id)}"><i data-lucide="wallet"></i> Add to Kalshi ticket</button>${chosen?`<p class="small muted pool-current">Your Pool pick: ${esc(chosen)}</p>`:''}</div>`;
}
function openKalshiChooser(id){const g=data?.games.find(g=>g.id===id);if(!g)return;openReviewSheet('Add to Kalshi ticket',`${kickoff(g.kickoff)}<p>Choose the team for your ticket.</p><div class="sheet-destinations">${[g.away,g.home].map(t=>`<button class="context-choice" data-review-game="${esc(g.id)}" data-review-team="${esc(t.name)}">${team(t.name,t.record)}<span class="review-choice-state">Select outcome</span></button>`).join('')}</div>`);}
document.addEventListener('click',e=>{const b=e.target.closest('[data-kalshi-choose]');if(b)openKalshiChooser(b.dataset.kalshiChoose)});
function addContextSelection(b) {
  const g = data?.games.find((g) => g.id === b.dataset.reviewGame),
    t = g && [g.away, g.home].find((t) => t.name === b.dataset.reviewTeam);
  if (!t || singleInReview(g.id, t.name)) return;
  tickets.push({
    id: "review-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    season: data.season,
    week: data.week,
    title: t.name + " to win",
    type: "Single Game Bet",
    source: tab === "picks" ? "AI Picks review" : "Game research review",
    status: "draft",
    stake: null,
    payout: null,
    fee: 0,
    market: null,
    proceeds: null,
    legs: [
      {
        gameId: g.id,
        team: t.name,
        side: "YES",
        marketPercent: null,
        kickoff: g.kickoff,
        record: t.record,
        opponent: (g.away.name === t.name ? g.home : g.away).name,
      },
    ],
    events: [],
    researchVersion: data.researchVersion,
  });
  save();
  b.disabled = true;
  b.querySelector(".review-choice-state").textContent = "Added";
  reviewFeedback(
    b.closest(".context-review").querySelector(".review-feedback"),
    "Saved for review. Enter pricing in Kalshi.",
  );
  syncReviewUI();
}
function reviewFeedback(target, message) {
  target.innerHTML = `<span>${message}</span><button data-open-review>Review drafts <i data-lucide="arrow-right"></i></button>`;
  icons();
}
function candidateInReview(id) {
  return scopeTickets().some(
    (t) =>
      t.status === "draft" && (t.candidateId === id || t.source === "AI " + id),
  );
}
function addCandidateReview(b) {
  const t = data?.comboCandidates.find((x) => x.id === b.dataset.add);
  if (!t || candidateInReview(t.id)) return;
  tickets.push({
    id: "candidate-" + Date.now() + "-" + t.id,
    title: t.title,
    season: data.season,
    week: data.week,
    strategy: t.strategy,
    type: t.type,
    candidateId: t.id,
    source: "AI " + t.id,
    stake: t.quoteSnapshot.stake,
    payout: t.quoteSnapshot.grossPayout,
    market: null,
    proceeds: null,
    fee: 0,
    status: "draft",
    legs: structuredClone(t.legs),
    events: [],
  });
  save();
  const actions=b.parentElement.classList.contains("candidate-actions")?b.parentElement:null;
  let feedback = (actions?.parentElement||b.parentElement).querySelector(".candidate-feedback");
  if (!feedback) {
    feedback = document.createElement("div");
    feedback.className = "review-feedback candidate-feedback";
    feedback.setAttribute("role", "status");
    if(actions)actions.after(feedback);else b.after(feedback);
  }
  reviewFeedback(feedback, "Saved with its historical quote.");
  syncReviewUI();
}
function reviewCombineBar(drafts) {
  const singles = drafts.filter(
    (t) => t.legs?.length === 1 && t.legs[0].side !== "PROP",
  );
  if (singles.length < 2) return "";
  return `<div class="review-combinebar"><span><b>Combine drafts</b><small id="combineCount">${comboSelection.size} selected</small></span><button class="primary" data-combine-drafts ${comboSelection.size < 2 ? "disabled" : ""}>Create combo</button></div>`;
}
function draftChoice(t) {
  return t.status === "draft" &&
    t.legs?.length === 1 &&
    t.legs[0].side !== "PROP"
    ? `<label class="draft-combine-choice"><input type="checkbox" data-combo-select="${esc(t.id)}" ${comboSelection.has(t.id) ? "checked" : ""}>Select for a combo</label>`
    : "";
}
function syncReviewUI() {
  const drafts = scopeTickets().filter((t) => t.status === "draft");
  for (const id of comboSelection)
    if (!drafts.some((t) => t.id === id)) comboSelection.delete(id);
  const nav = document.querySelector('nav [data-tab="kalshi"]');
  if (nav) {
    nav.querySelector(".review-count")?.remove();
    if (drafts.length)
      nav.insertAdjacentHTML(
        "beforeend",
        `<span class="review-count">${drafts.length}</span>`,
      );
    nav.setAttribute(
      "aria-label",
      `Kalshi, ${drafts.length} drafts for review`,
    );
  }
  document.querySelectorAll("[data-add]").forEach((b) => {
    const added = candidateInReview(b.dataset.add);
    b.disabled = added;
    b.innerHTML = added ? "Added to Kalshi review" : "Add to Kalshi review";
  });
  const count = document.querySelector("#combineCount");
  if (count) count.textContent = comboSelection.size + " selected";
  const combine = document.querySelector("[data-combine-drafts]");
  if (combine) combine.disabled = comboSelection.size < 2;
}
function combineDrafts() {
  const selected = scopeTickets().filter(
    (t) =>
      comboSelection.has(t.id) &&
      t.status === "draft" &&
      t.legs?.length === 1 &&
      t.legs[0].side !== "PROP",
  );
  if (selected.length < 2) return;
  const ids = selected.map((t) => t.legs[0].gameId);
  if (new Set(ids).size !== ids.length) {
    appAlert(
      "Choose one selection per game for a combo. Opposing selections can stay as separate singles.",
    );
    return;
  }
  const legs = selected.flatMap((t) => structuredClone(t.legs));
  const ticket = {
    id: "combo-" + Date.now(),
    season: 2026,
    week: Number($("#week").value),
    title: legs.map((l) => teamAbbr(l.team)).join(" + "),
    type: "Combo",
    source: "My review selections",
    status: "draft",
    stake: null,
    payout: null,
    market: null,
    fee: 0,
    proceeds: null,
    legs,
    events: [],
    originalDrafts: structuredClone(selected),
  };
  tickets = tickets.filter((t) => !selected.some((s) => s.id === t.id));
  tickets.push(ticket);
  comboSelection.clear();
  save();
  render();
  icons();
}
function undoCombo(id) {
  const t = tickets.find(
    (t) => t.id === id && t.status === "draft" && t.originalDrafts,
  );
  if (!t) return;
  tickets = tickets.filter((x) => x.id !== id);
  for (const original of t.originalDrafts)
    if (!tickets.some((x) => x.id === original.id)) tickets.push(original);
  closeReviewSheet();
  save();
  render();
  icons();
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.reviewGame) addContextSelection(b);
  if (b.hasAttribute("data-open-review")) {
    kalshiStage = "build";
    showBuilder = false;
    tab = "kalshi";
    sub = "";
    plan = "";
    render();
    icons();
  }
  if (b.hasAttribute("data-combine-drafts")) combineDrafts();
  if (b.dataset.undoCombo) undoCombo(b.dataset.undoCombo);
});
document.addEventListener("change", (e) => {
  const id = e.target.dataset.comboSelect;
  if (id) {
    e.target.checked ? comboSelection.add(id) : comboSelection.delete(id);
    syncReviewUI();
  }
});
window.addEventListener("load", () => {
  const header = document.querySelector("header");
  const resize = () =>
    document.documentElement.style.setProperty(
      "--header-height",
      header.getBoundingClientRect().height + "px",
    );
  resize();
  new ResizeObserver(resize).observe(header);
});
