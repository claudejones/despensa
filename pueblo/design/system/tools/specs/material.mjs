// Components that follow a Material 3 component. SRC[name] is filled from the live spec read.
import { SRC } from './sources.mjs';
const src = (k) => SRC[k] || 'Material 3. Spec page not yet read; sizes to verify.';

export const MATERIAL = [
  {
    name: 'TopBar', group: 'Navigation', height: 190, subtitle: 'Back, place name, coins',
    html: `
<div class="pb-topbar" style="margin:0 -16px"><button class="pb-iconbtn" aria-label="Back to town"><span data-ic="chevron-left"></span></button><h1 class="pb-topbar__title">Mercado</h1><div class="pb-topbar__end"><span class="pb-chip pb-chip--coins"><span data-ic="coins" data-size="18"></span>$120</span></div></div>
<div class="pb-topbar" style="margin:0 -16px"><h1 class="pb-topbar__title pb-topbar__title--plain" style="padding-left:16px">Progress</h1><div class="pb-topbar__end"><button class="pb-iconbtn" aria-label="Settings"><span data-ic="settings"></span></button></div></div>`,
    doc: {
      sum: 'The top bar names where you are and holds the way back.',
      use: ['Every screen except the title screen.'],
      not: ['Actions for the challenge. Those sit at the bottom, in thumb reach.'],
      anatomy: ['Back icon button on the left, inside a place.', 'Title: the place name in `rotulo-small`, or a plain screen name in `headline`.', 'One trailing item: the coin chip in a place, Settings elsewhere.'],
      place: 'Top of the screen, full width, on `cal`.',
      states: ['Rest.', 'The title truncates with an ellipsis; it never wraps.'],
      do: ['Use the rótulo face for place names only.'],
      dont: ['Put more than one trailing item in the bar.'],
      a11y: ['The back button is labelled with where it goes, such as "Back to town".', 'The title is the page heading.'],
      provide: 'The title, whether it is a place, and the trailing item.',
      source: src('TopBar'),
    },
  },
  {
    name: 'BottomBar', group: 'Navigation', height: 150, subtitle: 'Four destinations',
    html: `
<nav class="pb-navbar" style="margin:0 -16px" aria-label="Main" id="n">
  <button class="pb-navbar__item" aria-current="page"><span class="pb-navbar__pill" data-ic="map"></span>Town</button>
  <button class="pb-navbar__item"><span class="pb-navbar__pill" data-ic="list-checks"></span>Errands<span class="pb-navbar__dot">4</span></button>
  <button class="pb-navbar__item"><span class="pb-navbar__pill" data-ic="sparkles"></span>Progress</button>
  <button class="pb-navbar__item"><span class="pb-navbar__pill" data-ic="book-open"></span>Phrasebook</button>
</nav>`,
    js: `
var n = document.getElementById('n');
n.addEventListener('click', function (e) { var b = e.target.closest('.pb-navbar__item'); if (!b) return; n.querySelectorAll('.pb-navbar__item').forEach(function (x) { x.removeAttribute('aria-current'); }); b.setAttribute('aria-current', 'page'); });`,
    doc: {
      sum: 'The bottom bar moves between the four main parts of the game: Town, Errands, Progress and Phrasebook.',
      use: ['The four top-level screens.'],
      not: ['Inside a challenge or a conversation. It hides so nothing competes with the task.'],
      anatomy: ['64 high. Four items, each a 24 icon in a 56 by 32 pill and a label in `label-small`.', 'Active item: `cobalto-container` pill, heavier icon, bold label in `ink`.', 'Badge: a count in `ink`, 16 high, used on Errands for words waiting.'],
      place: 'Bottom of the screen, full width, on `cal-low`. A rail on the left at 600 wide and above.',
      states: ['Active.', 'Inactive.', 'With a count badge.'],
      motion: 'The pill grows out from the icon\'s centre with the fast spatial spring when chosen.',
      do: ['Always show labels.'],
      dont: ['Add a fifth item.', 'Colour the badge red; red means a wrong answer.'],
      a11y: ['Each item is at least 48 high.', 'The active item is marked with `aria-current`.', 'The badge count is read with the label.'],
      provide: 'Which item is active, and the Errands count.',
      source: src('BottomBar'),
    },
  },
  {
    name: 'Button', group: 'Controls', height: 330, subtitle: 'One primary action per screen',
    html: `
<button class="pb-btn">Go to checkout<span data-ic="chevron-right"></span></button>
<button class="pb-btn pb-btn--medium pb-btn--tonal">Hear it again</button>
<div class="line"><button class="pb-btn pb-btn--small">Next</button><button class="pb-btn pb-btn--small pb-btn--tonal">Skip</button><button class="pb-btn pb-btn--small pb-btn--outline">Hint</button><button class="pb-btn pb-btn--text">Not now</button></div>
<button class="pb-btn" disabled>Check</button>`,
    doc: {
      sum: 'A button starts an action; the filled cobalt button is the one thing to do next on a screen.',
      use: ['Filled: the single primary action, such as Check or Go to checkout.', 'Tonal: a helpful second action.', 'Outline and text: low-emphasis choices.'],
      not: ['Choosing among options. Use a button group.', 'Navigation between main screens. Use the bottom bar.'],
      anatomy: ['Container: `radius-full`. Primary is 56 high with 24 side padding; small is 40 high with 16.', 'Label: `word` style on the primary, `title` on the others.', 'One optional icon.'],
      place: 'The primary button sits at the bottom of the screen, full width inside the gutters.',
      states: ['Rest.', 'Pressed: the pill squares off to a 12 corner (8 on small).', 'Focus: 3px `ink` ring.', 'Disabled: `cal-container` with `ink-muted` label.'],
      motion: 'Fast spatial spring on press. The shape change is the feedback.',
      do: ['Keep labels to one to three words.', 'Disable Check until the task can be checked, and say why in the hint line.'],
      dont: ['Show two filled buttons on one screen.', 'Use cobalt for anything that is not an action.'],
      a11y: ['The primary button is 56 high. Small buttons are 40 high with a 48 touch target.', 'Label contrast is at least 4.5:1 in every variant.'],
      provide: 'The label, the variant and size, and an optional icon.',
      source: src('Button'),
    },
  },
  {
    name: 'ButtonGroup', group: 'Controls', height: 230, subtitle: 'Try it: one choice among a few',
    html: `
<p class="cap">How did saying it go?</p>
<div class="pb-group" role="group" aria-label="How did it go">
  <button class="pb-group__btn" aria-pressed="false"><span data-ic="frown" data-size="20"></span>Missed</button>
  <button class="pb-group__btn" aria-pressed="true"><span data-ic="meh" data-size="20"></span>Almost</button>
  <button class="pb-group__btn" aria-pressed="false"><span data-ic="smile" data-size="20"></span>Got it</button>
</div>
<p class="cap">Speaking as</p>
<div class="pb-group" role="group" aria-label="Speaking as" style="max-width:240px">
  <button class="pb-group__btn" aria-pressed="true">él</button><button class="pb-group__btn" aria-pressed="false">ella</button>
</div>`,
    js: `
document.querySelectorAll('.pb-group').forEach(function (g) { g.addEventListener('click', function (e) { var b = e.target.closest('.pb-group__btn'); if (!b) return;
  g.querySelectorAll('.pb-group__btn').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); }); });`,
    doc: {
      sum: 'A button group offers two to four choices where exactly one is chosen.',
      use: ['Rating how saying a line aloud went.', 'Either-or settings shown inline, such as who is speaking.'],
      not: ['More than four options. Use a list.', 'A plain on or off. Use a switch.'],
      anatomy: ['Segments 40 high with a 2 gap and a 48 touch target.', 'Unselected: `cal-container`, 8 inner corners.', 'Selected: `cobalto`, fully rounded.'],
      place: 'In the challenge area or a settings row.',
      states: ['Unselected.', 'Selected.', 'Pressed: the segment\'s corners tighten to 4.'],
      motion: 'Fast spatial spring on press and on selection.',
      do: ['Pair faces with words when rating; a face alone is ambiguous.'],
      dont: ['Use green and red for the rating. This is a self-report, not a marked answer.'],
      a11y: ['Each segment is a button with `aria-pressed`.', 'The group has a label.'],
      provide: 'The options and which is selected.',
      source: src('ButtonGroup'),
    },
  },
  {
    name: 'IconButton', group: 'Controls', height: 150, subtitle: 'A single icon you can press',
    html: `
<div class="line" style="gap:16px">
  <button class="pb-iconbtn" aria-label="Back"><span data-ic="chevron-left"></span></button>
  <button class="pb-iconbtn pb-iconbtn--tonal" aria-label="Hear it again"><span data-ic="volume-2"></span></button>
  <button class="pb-iconbtn pb-iconbtn--filled" aria-label="Speak"><span data-ic="mic"></span></button>
  <button class="pb-iconbtn pb-iconbtn--tonal pb-iconbtn--lg" aria-label="Hear it again"><span data-ic="volume-2"></span></button>
  <button class="pb-iconbtn" aria-label="What is this?"><span data-ic="info"></span></button>
</div>
<p class="cap">Standard, tonal, filled, large tonal, info.</p>`,
    doc: {
      sum: 'An icon button is a compact control for a familiar action shown by an icon alone.',
      use: ['Back, hear again, info, settings, pause.'],
      not: ['The primary action. That is always a labelled button.', 'An action whose icon is not obvious.'],
      anatomy: ['40 visible with a 24 icon and a 48 touch target; a 56 size for the main speaker button.', 'Standard: no container. Tonal: `cobalto-container`. Filled: `cobalto`.'],
      place: 'In the top bar, beside the dialogue box, or inside a row.',
      states: ['Rest.', 'Pressed: the circle squares off to an 8 corner (12 on the large size).', 'Focus: `ink` ring.'],
      motion: 'Fast spatial spring on press.',
      do: ['Give every icon button a spoken label.'],
      dont: ['Use an icon button for something destructive.'],
      a11y: ['Touch target is 48 even where the visible button is 40.', '`aria-label` says what it does.'],
      provide: 'The icon, the variant and the label.',
      source: src('IconButton'),
    },
  },
  {
    name: 'StatusPill', group: 'Controls', height: 130, subtitle: 'A small fact or balance',
    html: `
<div class="line"><span class="pb-chip pb-chip--coins"><span data-ic="coins" data-size="18"></span>$120</span><span class="pb-chip"><span data-ic="scale" data-size="18"></span>Budget $200</span><span class="pb-chip">3 of 8</span><span class="pb-chip"><span data-ic="users" data-size="18"></span>Two players</span></div>`,
    doc: {
      sum: 'A status pill shows one short fact, such as your coins or how far through a challenge you are.',
      use: ['Coin balance, budget, step count, mode.'],
      not: ['Spanish answers. Those are word tiles.', 'Lists that can grow past about six; use a list.'],
      anatomy: ['32 high, `radius-full`, `label` text, optional 18 icon.', 'Neutral: `cal-container`. Coins: `ocre`.', 'It is not pressable.'],
      place: 'In the top bar, or above a challenge.',
      do: ['Keep it to a few characters.'],
      dont: ['Make it pressable. For a set of choices use a button group.'],
      a11y: ['It reads as plain text to a screen reader.', 'Ochre always comes with the coin icon.'],
      provide: 'The text and an optional icon.',
      source: src('StatusPill'),
    },
  },
  {
    name: 'Switch', group: 'Controls', height: 130, subtitle: 'On or off, straight away',
    html: `
<div class="line" style="gap:24px"><label class="pb-switch"><input type="checkbox" checked aria-label="English subtitles"><span class="pb-switch__track"></span><span class="pb-switch__handle"></span></label><label class="pb-switch"><input type="checkbox" aria-label="Timed replies"><span class="pb-switch__track"></span><span class="pb-switch__handle"></span></label></div>
<p class="cap">On, off. Tap to try.</p>`,
    doc: {
      sum: 'A switch turns one setting on or off with immediate effect.',
      use: ['Settings: English subtitles, timed replies, sound, reduced motion.'],
      not: ['Choosing between two named options. Use a button group.', 'Anything that needs a Save step.'],
      anatomy: ['Track 52 by 32.', 'Handle: 16 when off, 24 when on, 28 while pressed.', 'On: `cobalto` track. Off: `cal-container` track with an `outline` border.'],
      place: 'At the right end of a settings row.',
      states: ['Off.', 'On.', 'Pressed.', 'Focus.'],
      motion: 'The handle slides and grows with the fast spatial spring.',
      do: ['Label the row with the thing being switched, not "Enable".'],
      dont: ['Use a switch without a visible label beside it.'],
      a11y: ['The whole row is the target.', 'It is a real checkbox, so it reads as on or off.'],
      provide: 'The setting\'s name and state.',
      source: src('Switch'),
    },
  },
  {
    name: 'ProgressBar', group: 'Controls', height: 170, subtitle: 'How far through',
    html: `
<div class="pb-progress pb-progress--steps" style="height:8px"><i class="on"></i><i class="on"></i><i class="on"></i><i></i><i></i><i></i><i></i><i></i></div>
<p class="cap">Steps in a challenge: 3 of 8.</p>
<div class="pb-progress"><div class="pb-progress__fill" style="width:62%"></div></div>
<p class="cap">A place's words: 62% known.</p>`,
    doc: {
      sum: 'A progress bar shows how far through a challenge you are, or how much of a place you know.',
      use: ['Steps within a challenge.', 'A place\'s share of known words, on the Progress screen.'],
      not: ['Waiting. Use the loading indicator.', 'Patience. Use the patience meter.'],
      anatomy: ['8 high, `radius-full`.', 'Fill: `ink`. Track: `cal-container`.', 'Stepped version: one segment per step with a 4 gap.'],
      place: 'Under the top bar for steps; inside a place card or the Progress screen for knowledge.',
      motion: 'The fill grows with the default spatial spring.',
      do: ['Pair it with the number in words, such as "3 of 8".'],
      dont: ['Colour progress green. Green means a correct answer.'],
      a11y: ['Give it a text value.', 'The fill meets 3:1 against its track.'],
      provide: 'The value, and the number of steps for the stepped version.',
      source: src('ProgressBar'),
    },
  },
  {
    name: 'QuantitySlider', group: 'Challenge', height: 290, subtitle: 'Try it: you need a kilo and a half',
    html: `
<div class="pb-talk"><div class="pb-dialogue"><p class="pb-dialogue__es">¿Cuánto le doy?</p><p class="pb-dialogue__en">How much shall I give you?</p></div></div>
<p class="cap">Your list says: a kilo and a half of tomatoes</p>
<div class="pb-slider" id="q">
  <div class="pb-slider__value" aria-live="polite"></div>
  <div class="pb-slider__rail"><div class="pb-slider__track"></div><input type="range" min="0" max="4" step="1" value="1" aria-label="Quantity"><div class="pb-slider__handle"></div></div>
  <div class="pb-slider__stops"><span>¼</span><span>½</span><span>1</span><span>1½</span><span>2</span></div>
</div>`,
    js: `
var S = ['un cuarto de kilo', 'medio kilo', 'un kilo', 'kilo y medio', 'dos kilos'], q = document.getElementById('q'), i = q.querySelector('input'), v = q.querySelector('.pb-slider__value');
function set() { q.style.setProperty('--pct', (i.value / i.max * 100) + '%'); v.textContent = S[i.value]; }
i.addEventListener('input', set); set();`,
    doc: {
      sum: 'The quantity slider sets how much of something you want, with each stop named in Spanish.',
      use: ['Weights and amounts at the market.', 'Any small ordered scale: how spicy, how many, what time.'],
      not: ['Exact large numbers. Use the number pad.', 'Settings with two values. Use a switch.'],
      anatomy: ['Value: the Spanish for the current stop, in `word` style, above the track.', 'Track: 16 high; filled part `cobalto`, rest `cobalto-container`, with a gap either side of the handle.', 'Handle: a 4 wide, 44 high bar that narrows while pressed.', 'Stop marks beneath.'],
      place: 'In the challenge area, under the request from the list.',
      states: ['Rest.', 'Pressed: the handle narrows.', 'Focus: `ink` ring on the handle.'],
      motion: 'The handle follows the finger directly and snaps to a stop with the fast spatial spring.',
      do: ['Show the Spanish for the stop, not the number, as the value.', 'Use five stops or fewer.'],
      dont: ['Label the stops in English; that removes the Spanish from the task.'],
      a11y: ['It is a real range input, so arrow keys and switch access work.', 'The handle\'s touch area is 44 high across the full track.', 'The value is announced as it changes.'],
      provide: 'The stops, each with its Spanish name, and the starting stop.',
      source: src('QuantitySlider'),
    },
  },
  {
    name: 'Card', group: 'Containers', height: 220, subtitle: 'A group that belongs together',
    html: `
<div class="pb-card"><p class="pb-card__title">Your shopping list</p><p class="pb-card__text">Three things to buy. Match each one to its Spanish name.</p></div>
<div class="pb-card pb-card--flat"><p class="pb-card__title">The stalls</p><p class="pb-card__text">A flat card for a supporting area.</p></div>`,
    doc: {
      sum: 'A card groups content and the controls that act on it.',
      use: ['The list in a challenge, a results block, a settings group.'],
      not: ['Wrapping a single line of text.', 'Nesting a raised card inside a raised card.'],
      anatomy: ['Raised: `card` with the soft shadow, `radius-xl`, 16 padding.', 'Flat: `cal-low`, no shadow.'],
      place: 'In the page column, full width inside the gutters.',
      do: ['Keep a card\'s controls inside it.', 'Use tone before shadow to separate things.'],
      dont: ['Add a coloured edge or stripe to a card.'],
      a11y: ['A card is not a button unless the whole card is one target.'],
      provide: 'The content.',
      source: src('Card'),
    },
  },
  {
    name: 'BottomSheet', group: 'Containers', height: 330, subtitle: 'Hints and results rise from below',
    html: `
<div style="background:var(--cal-container);border-radius:28px;overflow:hidden;padding-top:44px;margin:0 -4px">
  <div class="pb-sheet">
    <div class="pb-sheet__grab"><div class="pb-sheet__handle"></div></div>
    <p class="pb-sheet__title">Hint</p>
    <div class="pb-decode"><div class="pb-decode__w"><b>¿Qué</b><span>what</span></div><div class="pb-decode__w"><b>va</b><span>are you going</span></div><div class="pb-decode__w"><b>a</b><span>to</span></div><div class="pb-decode__w"><b>llevar?</b><span>take</span></div></div>
    <div style="margin-top:16px"><button class="pb-btn pb-btn--medium pb-btn--tonal">Got it</button></div>
  </div>
</div>`,
    doc: {
      sum: 'A bottom sheet brings up extra content over the current screen without leaving it.',
      use: ['Hints.', 'Results after a challenge.', 'Short forms and filters.'],
      not: ['Confirming something that cannot be undone. Use a dialog.', 'Content the player needs all the time.'],
      anatomy: ['Container: `card`, top corners `radius-xl`, at most 640 wide.', 'Drag handle: 32 by 4 in `outline`, in a 48 high grab zone.', 'Title in `headline`.', 'One closing action at the bottom.'],
      place: 'Rises from the bottom edge to at most half the screen, then pulls up to full height. A scrim covers the screen behind a modal sheet. On wide screens it becomes a side sheet.',
      states: ['Closed.', 'Open.', 'Dragged.'],
      motion: 'Rises with the default spatial spring. The scrim fades with the effects spring.',
      do: ['Let the player dismiss it by dragging down, tapping the scrim, or the closing button.'],
      dont: ['Stack a sheet on a sheet.'],
      a11y: ['Focus moves into the sheet and returns when it closes.', 'It can always be closed without dragging.'],
      provide: 'The title, the content and the closing action.',
      source: src('BottomSheet'),
    },
  },
  {
    name: 'SideSheet', group: 'Containers', height: 460, max: 780, subtitle: 'A panel at the edge on wide screens',
    html: `
<div style="position:relative;height:420px;border-radius:28px;overflow:hidden;background:var(--cal-container)">
  <div style="padding:24px;max-width:340px"><p class="headline">Town</p><p class="body" style="color:var(--ink-muted)">The town stays visible beside the panel.</p></div>
  <div class="pb-overlay pb-overlay--end">
    <aside class="pb-sidesheet" aria-label="Settings">
      <div class="pb-sidesheet__head"><h2 class="pb-sidesheet__title">Settings</h2><button class="pb-iconbtn" aria-label="Close settings"><span data-ic="x"></span></button></div>
      <div class="pb-sidesheet__body">
        <div class="pb-setrow" style="padding-left:0;padding-right:0"><span data-ic="captions"></span><div class="pb-setrow__body"><p class="pb-setrow__title">English subtitles</p><p class="pb-setrow__text">Show the English under what people say.</p></div><label class="pb-switch"><input type="checkbox" checked aria-label="English subtitles"><span class="pb-switch__track"></span><span class="pb-switch__handle"></span></label></div>
        <div class="pb-setrow" style="padding-left:0;padding-right:0"><span data-ic="timer"></span><div class="pb-setrow__body"><p class="pb-setrow__title">Timed replies</p><p class="pb-setrow__text">People lose patience if you take too long.</p></div><label class="pb-switch"><input type="checkbox" aria-label="Timed replies"><span class="pb-switch__track"></span><span class="pb-switch__handle"></span></label></div>
      </div>
    </aside>
  </div>
</div>`,
    doc: {
      sum: 'A side sheet is a panel at the trailing edge of a wide screen that holds what would be a bottom sheet or a whole screen on a phone.',
      use: ['Settings, the phrasebook, a hint or a word\'s details, on screens 600 wide and up.', 'Standard: content that sits beside the main screen and stays open.', 'Modal: content that must be dealt with or closed, over a scrim.'],
      not: ['Phones. Use a bottom sheet or a full screen there.', 'Confirming something that cannot be undone. Use a dialog.'],
      anatomy: ['Container: `card`, 360 wide and never more than 400, 24 padding, full height.', 'Header: title in `headline` and a close icon button.', 'Body that scrolls on its own.', 'Modal: rounded leading corners and a soft shadow over a scrim. Standard: a hairline divider and no shadow.'],
      place: 'Against the trailing edge. A standard sheet pushes the main content narrower; a modal sheet covers it.',
      states: ['Closed.', 'Open.'],
      motion: 'Slides in from the edge with the default spatial spring.',
      do: ['Always show the close button.', 'Turn a phone\'s bottom sheet into a side sheet when the screen is wide enough.'],
      dont: ['Scroll sideways inside it.', 'Open one sheet over another.'],
      a11y: ['Focus moves into a modal sheet and returns when it closes.', 'Escape and the close button both close it.'],
      provide: 'The title, the content, and whether it is standard or modal.',
      source: src('SideSheet'),
    },
  },
  {
    name: 'Dialog', group: 'Containers', height: 300, subtitle: 'Only for what cannot be undone',
    html: `
<div class="pb-dialog">
  <div class="pb-dialog__icon" data-ic="rotate-ccw" data-size="28"></div>
  <p class="pb-dialog__title">Reset your progress?</p>
  <p class="pb-dialog__text">Every word goes back to new and your town is repainted blank. This cannot be undone.</p>
  <div class="pb-dialog__actions"><button class="pb-btn pb-btn--text">Keep my progress</button><button class="pb-btn pb-btn--small">Reset</button></div>
</div>`,
    doc: {
      sum: 'A dialog interrupts to confirm a choice that cannot be undone.',
      use: ['Resetting progress.', 'Leaving a can-do check part way.'],
      not: ['Hints, results or anything routine. Use a bottom sheet.', 'Errors the player can simply fix.'],
      anatomy: ['Container: `card`, `radius-xl`, 24 padding, 280 to 560 wide.', 'Optional icon, title in `headline`, text in `body`.', 'Two actions at the lower right: the safe one as text, the committing one filled.'],
      place: 'Centred over a scrim.',
      motion: 'Appears with the default effects spring; no bounce.',
      do: ['Name the actions for what they do: "Reset", "Keep my progress".'],
      dont: ['Use "OK" and "Cancel".', 'Colour the committing action red; say what it does in words instead.'],
      a11y: ['Focus is trapped in the dialog.', 'Escape and the safe action both close it.'],
      provide: 'The title, the consequence in one or two sentences, and the two action labels.',
      source: src('Dialog'),
    },
  },
  {
    name: 'Snackbar', group: 'Feedback', height: 130, subtitle: 'A brief message with one action',
    html: `
<div class="pb-snackbar"><span>Hint used. That cost $5.</span><button>Undo</button></div>
<div class="pb-snackbar"><span>Progress backed up.</span></div>`,
    doc: {
      sum: 'A snackbar tells the player something just happened and offers at most one action.',
      use: ['Confirming a small action, with an Undo where possible.'],
      not: ['Right or wrong feedback. That belongs on the answer itself.', 'Anything the player must read to continue.'],
      anatomy: ['Container: `ink`, `radius-md`, 48 high.', 'Message in `label`, in `cal`.', 'One text action. No icon.'],
      place: 'Above the primary button, never over the bottom bar.',
      motion: 'Slides up with the default spatial spring. Without an action it leaves after 4 to 10 seconds; with one it stays until dismissed.',
      do: ['Keep it to one line.'],
      dont: ['Add an icon.', 'Show two at once.'],
      a11y: ['Announced politely to screen readers.', 'Stays long enough to read, and longer if it has an action.'],
      provide: 'The message and an optional action.',
      source: src('Snackbar'),
    },
  },
  {
    name: 'TypingField', group: 'Controls', height: 400, subtitle: 'Type the Spanish yourself',
    html: `
<label class="pb-field"><span class="pb-field__label">carrots</span><input class="pb-field__input" placeholder="Type it in Spanish" autocomplete="off" autocapitalize="off" spellcheck="false"></label>
<label class="pb-field" data-state="correct"><span class="pb-field__label">limes</span><input class="pb-field__input" value="limones" readonly><span class="pb-field__help"><span data-ic="check" data-size="16" data-sw="3"></span>Correct</span></label>
<label class="pb-field" data-state="near"><span class="pb-field__label">bananas</span><input class="pb-field__input" value="platanos" readonly><span class="pb-field__help"><span data-ic="info" data-size="16"></span>Nearly. It takes an accent: plátanos</span></label>
<label class="pb-field" data-state="wrong"><span class="pb-field__label">apples</span><input class="pb-field__input" value="naranjas" readonly><span class="pb-field__help"><span data-ic="x" data-size="16" data-sw="3"></span>Not this one</span></label>`,
    doc: {
      sum: 'The typing field is where the player writes a Spanish word or phrase from memory.',
      use: ['The typing rung of a challenge, after matching is mastered.'],
      not: ['Amounts. Use the number pad.', 'A first meeting with a word. Start with matching.'],
      anatomy: ['Label: the English prompt, above the field.', 'Field: `card` with a 2px `outline` border, `radius-md`, 56 high, text in `word` style.', 'Help line beneath for the result.', 'Accent keys directly under it.'],
      place: 'In the challenge area. The primary button stays visible above the keyboard.',
      states: ['Empty.', 'Focus: 3px `cobalto` border.', 'Correct.', 'Nearly: right letters, missing accent; shown in ink with the accented form.', 'Wrong.'],
      do: ['Accept an answer without accents as nearly right and show the correct form.', 'Turn off autocorrect and autocapitalise.'],
      dont: ['Use the placeholder as the only label.'],
      a11y: ['The label is always visible.', 'Results carry an icon and words.', 'Text is 22px.'],
      provide: 'The English prompt, the expected Spanish and the state.',
      source: src('TypingField'),
    },
  },
  {
    name: 'InfoTip', group: 'Feedback', height: 190, subtitle: 'A short explanation on request',
    html: `
<div class="line"><span class="pb-chip"><span data-ic="timer" data-size="18"></span>Patience</span><button class="pb-iconbtn" aria-label="What is patience?" id="b"><span data-ic="info"></span></button></div>
<div class="pb-tip" id="t" role="tooltip"><p class="pb-tip__title">Patience</p><p class="pb-tip__text">Doña Carmen will only wait so long. Answer before the pips run out, or switch timing off in Settings.</p></div>`,
    js: `
var t = document.getElementById('t'); document.getElementById('b').addEventListener('click', function () { t.hidden = !t.hidden; });`,
    doc: {
      sum: 'An info tip explains one thing on the screen when the player asks.',
      use: ['Explaining a game idea the first time it appears: patience, hints, tokens.'],
      not: ['Translating Spanish. That is the hint sheet.', 'Anything the player must know to proceed; say that on the screen.'],
      anatomy: ['Info icon button as the trigger.', 'Tip: `cal-container`, `radius-md`, a title in `label` and one or two sentences.'],
      place: 'Anchored to its trigger, inside the screen edges.',
      states: ['Hidden.', 'Shown until dismissed.'],
      motion: 'Appears with the fast effects spring.',
      do: ['Keep it to two sentences.'],
      dont: ['Open a tip automatically more than once.'],
      a11y: ['Opens on tap and on keyboard focus, never on hover alone.', 'The trigger says what it explains.'],
      provide: 'The title and the text.',
      source: src('InfoTip'),
    },
  },
  {
    name: 'SettingsRow', group: 'Containers', height: 290, subtitle: 'One setting per row',
    html: `
<div class="pb-card" style="padding:0">
  <div class="pb-setrow"><span data-ic="captions"></span><div class="pb-setrow__body"><p class="pb-setrow__title">English subtitles</p><p class="pb-setrow__text">Show the English under what people say.</p></div><label class="pb-switch"><input type="checkbox" checked aria-label="English subtitles"><span class="pb-switch__track"></span><span class="pb-switch__handle"></span></label></div>
  <div class="pb-setrow"><span data-ic="timer"></span><div class="pb-setrow__body"><p class="pb-setrow__title">Timed replies</p><p class="pb-setrow__text">People lose patience if you take too long.</p></div><label class="pb-switch"><input type="checkbox" aria-label="Timed replies"><span class="pb-switch__track"></span><span class="pb-switch__handle"></span></label></div>
  <div class="pb-setrow"><span data-ic="volume-2"></span><div class="pb-setrow__body"><p class="pb-setrow__title">Voice speed</p><p class="pb-setrow__text">Slower</p></div><span data-ic="chevron-right"></span></div>
</div>`,
    doc: {
      sum: 'A settings row holds one setting: its icon, name, a line of explanation and its control.',
      use: ['The Settings screen.'],
      not: ['Game content. Use the list row for prompts.'],
      anatomy: ['Leading icon in `ink`.', 'Name in `title`, explanation in `label`.', 'Trailing control: a switch, or a chevron to a further choice.', '72 high, rows divided by `outline-soft`.'],
      place: 'Grouped inside a card.',
      do: ['Explain what the setting does in one plain sentence.'],
      dont: ['Put two controls in one row.'],
      a11y: ['The whole row toggles its switch.', 'The control\'s label is the row\'s name.'],
      provide: 'The icon, name, explanation and control.',
      source: src('SettingsRow'),
    },
  },
  {
    name: 'LoadingIndicator', group: 'Feedback', height: 150, subtitle: 'A short wait',
    html: `
<div class="line" style="gap:16px"><div class="pb-loading" id="l" data-shape="cookie"></div><p class="cap">Setting up the market…</p></div>`,
    js: `
var l = document.getElementById('l'), seq = ['cookie', 'clover', 'burst', 'squircle', 'flower', 'sunny'], k = 0;
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(function () { k = (k + 1) % seq.length; l.style.clipPath = Pueblo.shape(seq[k]); }, 700);`,
    doc: {
      sum: 'The loading indicator shows the game is working during a short wait.',
      use: ['Waits between about 200 milliseconds and 5 seconds.'],
      not: ['Longer waits. Use a progress bar that shows how far along it is.', 'Waits under 200 milliseconds. Show nothing.'],
      anatomy: ['One 38 shape in `cobalto`, in a 48 box, that keeps morphing through the shape set while turning.', 'An optional line saying what is happening.'],
      place: 'Centred in the area that is loading.',
      motion: 'Morphs with the slow spatial spring every 700 ms.',
      do: ['Say what is loading when the wait is over a second.'],
      dont: ['Cover the whole screen for a partial load.'],
      a11y: ['Under reduced motion it is a still shape with the text.', 'The text is announced.'],
      provide: 'An optional message.',
      source: src('LoadingIndicator'),
    },
  },
  {
    name: 'EmptyState', group: 'Feedback', height: 330, subtitle: 'Nothing here, and what to do',
    html: `
<div class="pb-empty"><div class="pb-empty__shape" data-shape="flower"><span data-ic="list-checks" data-size="36"></span></div><p class="pb-empty__title">No errands today</p><p class="pb-empty__text">Every word is fresh. Visit a new place, or come back tomorrow.</p><button class="pb-btn pb-btn--small" style="margin-top:8px">Go to town</button></div>`,
    doc: {
      sum: 'An empty state explains why a screen has nothing on it and offers the next step.',
      use: ['No errands due, no achievements yet, an empty phrasebook section.'],
      not: ['Errors. Say what went wrong and how to fix it.', 'Loading.'],
      anatomy: ['A neutral shape with an icon.', 'A title in `headline`.', 'One or two sentences in `body`.', 'One action.'],
      place: 'Centred in the empty area.',
      do: ['Say what to do next.'],
      dont: ['Use a sad or apologetic tone. Nothing has gone wrong.'],
      a11y: ['The shape is decorative.', 'The action is a real button.'],
      provide: 'The icon, title, text and action.',
      source: src('EmptyState'),
    },
  },
  {
    name: 'ResultsSummary', group: 'Feedback', height: 480, subtitle: 'What you got and what slipped',
    html: `
<div class="pb-card pb-results">
  <p class="pb-card__title" style="margin-bottom:8px">Market trip</p>
  <div class="pb-stat"><div><b>7</b><span>of 8 right</span></div><div><b>1</b><span>hint used</span></div><div><b>$35</b><span>earned</span></div></div>
  <div style="margin-top:12px">
    <div class="pb-results__row"><div class="pb-token" data-state="known" data-shape="sunny">Known</div><div class="pb-results__body"><p class="pb-results__es">limones</p><p class="pb-results__en">limes · moved up</p></div><span data-ic="arrow-right"></span></div>
    <div class="pb-results__row"><div class="pb-token" data-state="learning" data-shape="clover">Learning</div><div class="pb-results__body"><p class="pb-results__es">zanahorias</p><p class="pb-results__en">carrots · missed once, back on your errands</p></div><span data-ic="arrow-right"></span></div>
  </div>
</div>
<button class="pb-btn">Back to town</button>`,
    doc: {
      sum: 'The results summary closes a challenge: what you got right, what slipped, and what you earned.',
      use: ['The end of every challenge.'],
      not: ['Mid-challenge feedback.'],
      anatomy: ['Three figures: right answers, hints used, pesos earned.', 'A row per word that changed state: its mastery token, the Spanish, the English and what happened.', 'One primary button.'],
      place: 'In a bottom sheet over the challenge, or as its own screen after a can-do check.',
      motion: 'Tokens morph to their new state one after another with the default spatial spring.',
      do: ['List only words whose state changed.', 'Say where a missed word goes next.'],
      dont: ['Show a grade or percentage as the headline.', 'Use green and red here; the answers were already marked.'],
      a11y: ['Figures have text labels.', 'Each row reads as one sentence.'],
      provide: 'The three figures and the changed words.',
      source: src('ResultsSummary'),
    },
  },
];
