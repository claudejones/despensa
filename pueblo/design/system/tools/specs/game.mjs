// Game-specific components: Pueblo's own, built on the Material foundations.
const OWN = 'Pueblo original. Uses Material 3 colour roles, the corner radius scale and the Expressive springs.';
const sceneBlocks = '<div class="pb-scene__wall"></div><div class="pb-scene__who"></div><div class="pb-scene__counter"></div>';

export const GAME = [
  {
    name: 'WordTile', group: 'Challenge', height: 150, subtitle: 'A Spanish word you can pick up',
    html: `
<div class="line"><span class="pb-tile">limones</span><span class="pb-tile">zanahorias</span><span class="pb-tile is-picked">plátanos</span></div>
<p class="cap">Rest, rest, picked. Press one to feel the squish.</p>`,
    doc: {
      sum: 'A word tile is one Spanish word or short phrase that you pick up and place.',
      use: ['Any answer the player chooses or arranges: matching, building a sentence, replying.'],
      not: ['English text. English is never a tile.', 'Anything with a picture. A tile is text only, which is the picture rule.'],
      anatomy: ['Container: `cobalto-container`, `radius-md`, 48 high.', 'Label: `word` style in `on-cobalto-container`.'],
      place: 'In a tile tray, or inside a blank slot once placed.',
      states: ['Rest.', 'Pressed: grows, tilts 2 degrees, corners round to `radius-lg-inc`.', 'Picked: 3px `cobalto` outline.', 'Placed: takes the slot\'s colours.'],
      motion: 'Fast spatial spring on press; default spatial spring when it lands.',
      do: ['Keep a tile to one to three words.', 'Show accents and opening marks exactly.'],
      dont: ['Put an icon or picture on a tile.', 'Colour a tile green or red before the player checks.'],
      a11y: ['48 high touch target.', 'Tap a tile then tap a blank as the alternative to dragging.', 'The outline, not colour alone, marks the picked tile.'],
      provide: 'The Spanish text, and `data-word` with the same text for checking.',
      source: OWN,
    },
  },
  {
    name: 'BlankSlot', group: 'Challenge', height: 190, subtitle: 'Where a Spanish word lands',
    html: `
<div class="line"><span class="pb-slot"></span><span class="pb-slot pb-slot--filled">limones</span></div>
<div class="line"><span class="pb-slot pb-slot--correct"><span data-ic="check" data-size="18" data-sw="3"></span>limones</span><span class="pb-slot pb-slot--wrong"><span data-ic="x" data-size="18" data-sw="3"></span>limas</span></div>
<p class="cap">Empty, filled, correct, wrong.</p>`,
    doc: {
      sum: 'A blank slot is the empty space beside an English prompt that a Spanish tile goes into.',
      use: ['Every place the player must supply Spanish.'],
      not: ['Free typing. Use the typing field for that.'],
      anatomy: ['Container: `cal-container` with a 2px dashed `outline` border, `radius-lg`, 48 high, at least 132 wide.', 'Content: the placed tile\'s text in `word` style.'],
      place: 'At the right end of a list row, or in a line of slots for building a sentence.',
      states: ['Empty.', 'Filled: `cobalto-container`.', 'Correct: `nopal` with a check icon.', 'Wrong: `cochinilla` with an x icon.'],
      motion: 'The tile lands with the default spatial spring. Colour changes use the effects spring and do not bounce.',
      do: ['Show correct and wrong only after the player checks.'],
      dont: ['Size the blank to the answer\'s length. That gives the answer away.'],
      a11y: ['The dashed border meets 3:1 against the page.', 'Correct and wrong always carry an icon as well as colour.'],
      provide: '`data-answer` with the expected Spanish.',
      source: OWN,
    },
  },
  {
    name: 'ListRow', group: 'Challenge', height: 250, subtitle: 'English and icon, then the blank',
    html: `
<div class="pb-list">
  <div class="pb-listrow"><span class="pb-listrow__pic" data-ic="citrus"></span><span class="pb-listrow__en">limes<span class="pb-listrow__qty">half a kilo</span></span><span class="pb-slot"></span></div>
  <div class="pb-listrow" data-result="correct"><span class="pb-listrow__pic" data-ic="banana"></span><span class="pb-listrow__en">bananas<small class="ok">Correct</small></span><span class="pb-slot pb-slot--correct"><span data-ic="check" data-size="18" data-sw="3"></span>plátanos</span></div>
  <div class="pb-listrow" data-result="wrong"><span class="pb-listrow__pic" data-ic="carrot"></span><span class="pb-listrow__en">carrots<small class="no">Not this one</small></span><span class="pb-slot pb-slot--wrong"><span data-ic="x" data-size="18" data-sw="3"></span>manzanas</span></div>
</div>`,
    doc: {
      sum: 'A list row pairs one English prompt and its icon with one blank slot.',
      use: ['Shopping lists, menus, symptoms, tasks: any set of things to say in Spanish.'],
      not: ['Showing Spanish on the left. The left side is always the side you already understand.'],
      anatomy: ['Icon tile: 44 square, `cal-low`.', 'English: `title` style, with an optional quantity line in `label`.', 'Blank slot on the right.', 'Rows sit inside one `card` container with `radius-xl`.'],
      place: 'In the challenge area, under the dialogue box.',
      states: ['Rest.', 'Correct: `nopal-container` row with the word "Correct".', 'Wrong: `cochinilla-container` row with "Not this one".'],
      do: ['Use an icon only when it is unambiguous.', 'Keep a list to six rows or fewer on one screen.'],
      dont: ['Reveal the right answer in a wrong row until the player has tried again.'],
      a11y: ['Each result carries a word, an icon and a colour.', 'Rows are 64 high.'],
      provide: 'English text, an icon name, an optional quantity, and the slot\'s answer.',
      source: OWN,
    },
  },
  {
    name: 'TileTray', group: 'Challenge', height: 520, subtitle: 'Try it: drag or tap to match',
    html: `
<div data-match id="m">
  <div class="pb-list">
    <div class="pb-listrow"><span class="pb-listrow__pic" data-ic="citrus"></span><span class="pb-listrow__en">limes<small class="ok">Correct</small><small class="no">Not this one</small></span><span class="pb-slot" data-answer="limones"></span></div>
    <div class="pb-listrow"><span class="pb-listrow__pic" data-ic="carrot"></span><span class="pb-listrow__en">carrots<small class="ok">Correct</small><small class="no">Not this one</small></span><span class="pb-slot" data-answer="zanahorias"></span></div>
    <div class="pb-listrow"><span class="pb-listrow__pic" data-ic="banana"></span><span class="pb-listrow__en">bananas<small class="ok">Correct</small><small class="no">Not this one</small></span><span class="pb-slot" data-answer="plátanos"></span></div>
  </div>
  <div class="pb-tray" data-tray style="margin-top:12px">
    <span class="pb-tray__label">The stalls</span>
    <span class="pb-tile" data-word="zanahorias">zanahorias</span><span class="pb-tile" data-word="manzanas">manzanas</span><span class="pb-tile" data-word="plátanos">plátanos</span><span class="pb-tile" data-word="limones">limones</span><span class="pb-tile" data-word="cerezas">cerezas</span>
  </div>
</div>
<button class="pb-btn" id="chk" disabled>Check</button>`,
    js: `
var root = document.getElementById('m'), btn = document.getElementById('chk'), m = Pueblo.match(root), done = false;
root.addEventListener('pb-change', function (e) { done = false; btn.textContent = 'Check'; btn.disabled = e.detail.filled < e.detail.total; });
btn.addEventListener('click', function () {
  if (done) { m.reset(); return; }
  var r = m.check(); done = true; btn.textContent = r.correct === r.total ? 'All correct. Play again' : 'Start over';
});`,
    doc: {
      sum: 'A tile tray holds the Spanish tiles the player chooses from, and with a list above it forms the matching challenge.',
      use: ['Matching Spanish to English prompts.', 'Holding the word bank for building a sentence.'],
      not: ['More than about eight tiles. Past that, split the challenge.'],
      anatomy: ['Container: `cal-low`, `radius-xl`.', 'Label: the place\'s name for the bank, such as "The stalls".', 'Tiles wrap in rows with an 8 gap.'],
      place: 'Directly under the list, above the primary button.',
      states: ['Tiles leave the tray when placed and return when tapped in their slot.'],
      motion: 'A dragged tile follows the finger with no easing, then lands with the default spatial spring.',
      do: ['Include one or two wrong tiles so matching is not solved by elimination.', 'Shuffle the tiles on every visit.'],
      dont: ['Put pictures in the tray.', 'Order the tiles to match the list.'],
      a11y: ['Dragging always has a tap alternative: tap a tile, then tap a blank.', 'The Check button stays disabled until every blank is filled.'],
      provide: 'The tiles, each with `data-word`. Call `Pueblo.match(root)`; it returns `check()` and `reset()` and fires `pb-change`.',
      source: OWN,
    },
  },
  {
    name: 'Money', group: 'Challenge', height: 420, subtitle: 'Try it: pay 145 pesos',
    html: `
<div class="pb-talk"><div class="pb-dialogue"><p class="pb-dialogue__es">Son ciento cuarenta y cinco pesos.</p><p class="pb-dialogue__en">That's 145 pesos.</p></div></div>
<div class="pb-till" id="till">
  <div class="pb-till__head"><span>On the counter</span><b data-paid>$0</b></div>
  <div class="pb-till__zone pb-till__zone--counter" data-counter></div>
  <div class="pb-till__head"><span>Your wallet</span></div>
  <div class="pb-till__zone" data-wallet>
    <span class="pb-note" data-value="100">100</span><span class="pb-note" data-value="50">50</span><span class="pb-note" data-value="20">20</span><span class="pb-note" data-value="20">20</span>
    <span class="pb-coin" data-value="10">10</span><span class="pb-coin" data-value="5">5</span><span class="pb-coin pb-coin--sm" data-value="2">2</span><span class="pb-coin pb-coin--sm" data-value="1">1</span>
  </div>
</div>
<p class="cap" id="msg">Tap notes and coins to put them on the counter.</p>`,
    js: `
var t = document.getElementById('till'), msg = document.getElementById('msg');
t.addEventListener('pb-change', function (e) { var p = e.detail.paid; msg.textContent = p === 145 ? 'Exact. No change needed.' : p > 145 ? 'Your change would be $' + (p - 145) + '.' : 'Tap notes and coins to put them on the counter.'; });
Pueblo.pay(t);`,
    doc: {
      sum: 'Money is the set of peso notes and coins the player pays with, and the counter they pay onto.',
      use: ['Checkout, fares, the bank: any time the player must act on a number heard or read in Spanish.'],
      not: ['Showing a score or reward. Use the coin chip for a balance.'],
      anatomy: ['Coin: `ocre` disc, 56 or 44 across, value in numerals.', 'Note: `card` with `ocre` end bands, value in `ocre-ink`.', 'Counter: a dashed zone showing what has been paid and its total.', 'Wallet: what the player holds.'],
      place: 'In the challenge area at checkout. The amount is spoken and shown in the dialogue box above.',
      states: ['In the wallet.', 'On the counter.'],
      motion: 'A coin hops with the fast spatial spring when it moves.',
      do: ['State the amount in Spanish words in the dialogue, never as numerals, so the number must be understood.', 'Give a wallet that allows more than one way to pay.'],
      dont: ['Use ochre for anything that is not money.', 'Copy the artwork of real banknotes.'],
      a11y: ['Each coin and note is at least 44 across.', 'The running total is always shown as text.'],
      provide: 'The wallet contents, each with `data-value`. Call `Pueblo.pay(root)`; it fires `pb-change` with the amount paid.',
      source: OWN,
    },
  },
  {
    name: 'PatienceMeter', group: 'Challenge', height: 130, subtitle: 'How long the character will wait',
    html: `
<div class="line">
  <span class="pb-patience"><span data-ic="timer" data-size="18"></span>Patience<span class="pb-patience__pips"><i></i><i></i><i></i><i></i><i></i></span></span>
  <span class="pb-patience"><span data-ic="timer" data-size="18"></span>Patience<span class="pb-patience__pips"><i></i><i></i><i class="off"></i><i class="off"></i><i class="off"></i></span></span>
</div>
<p class="cap">Full, and two left. The character's face changes with it.</p>`,
    doc: {
      sum: 'The patience meter shows how much longer a townsperson will wait for your reply.',
      use: ['Timed challenges and the timed rung of a conversation.'],
      not: ['Untimed practice. Leave it off so beginners are not rushed.', 'A countdown in seconds. Patience is a mood, not a clock.'],
      anatomy: ['Pill: `card`, 32 high.', 'Timer icon and the word "Patience".', 'Five pips in `ink`; spent pips turn `outline-soft` and shrink.'],
      place: 'Top left of the scene window.',
      states: ['Five to one pips.', 'Empty: the character speaks and the turn ends.'],
      motion: 'A pip shrinks with the fast spatial spring. No flashing.',
      do: ['Change the character\'s expression at three pips and at one.'],
      dont: ['Colour it red. Red means a wrong answer and nothing else.'],
      a11y: ['The pips carry a text alternative, such as "Patience 2 of 5".', 'Offer a setting that turns timing off.'],
      provide: 'The number of pips left.',
      source: OWN,
    },
  },
  {
    name: 'SceneWindow', group: 'Dialogue', height: 320, subtitle: 'The pixel-art stage',
    html: `
<div class="pb-scene" data-place="mercado">${sceneBlocks}
  <span class="pb-scene__hud pb-patience"><span data-ic="timer" data-size="18"></span>Patience<span class="pb-patience__pips"><i></i><i></i><i></i><i></i><i class="off"></i></span></span>
  <span class="pb-scene__tag">Placeholder scene</span>
</div>
<div class="line" id="pl"></div>`,
    css: '  .sw { width: 36px; height: 36px; border-radius: 12px; border: 2px solid var(--outline-soft); cursor: pointer; }',
    js: `
var P = [['mercado','wall-ocre'],['restaurante','wall-rosa'],['sitio','wall-caribe'],['clinica','wall-jade'],['casa','wall-terracota'],['plaza','wall-cal'],['escuela','wall-purpura'],['banco','wall-anil']];
var sc = document.querySelector('.pb-scene'), pl = document.getElementById('pl');
pl.innerHTML = P.map(function (p) { return '<button class="sw" title="' + p[0] + '" aria-label="' + p[0] + '" data-p="' + p[0] + '" style="background:var(--' + p[1] + ')"></button>'; }).join('');
pl.addEventListener('click', function (e) { var b = e.target.closest('[data-p]'); if (b) sc.setAttribute('data-place', b.getAttribute('data-p')); });`,
    doc: {
      sum: 'The scene window is the framed stage at the top of a screen where the place and its character appear in pixel art.',
      use: ['Every screen inside a place.'],
      not: ['The town map, which is its own full-screen scene.'],
      anatomy: ['Frame: `radius-xl`, 196 high, full width inside the 16 gutters.', 'Scene: pixel art, scaled by whole multiples and never smoothed.', 'Character: centred, with expression sprites.', 'Heads-up items: patience top left.'],
      place: 'Directly under the top bar. The dialogue box overlaps its lower edge by 24.',
      states: ['One wall colour per place, set with `data-place`.', 'The character\'s expression: neutral, talking, happy, confused, impatient, surprised.'],
      motion: 'Expression changes are a sprite swap with no tween. The scene itself does not move during a challenge.',
      do: ['Keep everything the player must read outside the scene.'],
      dont: ['Put Material controls or shapes inside the scene.', 'Put the things being asked for in the scene as pictures next to Spanish labels.'],
      a11y: ['The scene is decorative; give it a short label such as "The market".', 'Nothing the player needs is shown only in the scene.'],
      provide: 'The place, the scene art and the character sprite sheet. Until art exists, the flat-block placeholder stands in.',
      source: OWN,
    },
  },
  {
    name: 'DialogueBox', group: 'Dialogue', height: 250, subtitle: 'Spanish spoken, English subtitle',
    html: `
<div class="pb-talk">
  <div class="pb-dialogue" id="d"><p class="pb-dialogue__who">Doña Carmen</p><p class="pb-dialogue__es">¿Qué va a llevar?</p><p class="pb-dialogue__en">What would you like?</p></div>
  <button class="pb-iconbtn pb-iconbtn--tonal" aria-label="Hear it again" data-say="¿Qué va a llevar?"><span data-ic="volume-2"></span></button>
</div>
<div class="line"><button class="pb-btn pb-btn--small pb-btn--tonal" id="sub"><span data-ic="captions" data-size="20"></span>Subtitles on</button></div>
<p class="cap">The speaker button uses your device's Spanish voice.</p>`,
    js: `
var d = document.getElementById('d'), b = document.getElementById('sub');
b.addEventListener('click', function () { var off = d.getAttribute('data-subtitles') === 'off'; d.setAttribute('data-subtitles', off ? 'on' : 'off'); b.lastChild.textContent = off ? 'Subtitles on' : 'Subtitles off'; });`,
    doc: {
      sum: 'The dialogue box shows what a townsperson says in Spanish, with an English subtitle beneath it.',
      use: ['Every line a character speaks, including instructions given in character.'],
      not: ['Interface instructions such as "Drag the word". Those are plain `body` text.'],
      anatomy: ['Box: `card`, `radius-lg-inc`, soft shadow.', 'Name: `label-small` in `ink-muted`.', 'Spanish line: `dialogue` style, the pixel face.', 'English subtitle: `label` in `ink-muted`.', 'Speaker button beside the box.'],
      place: 'Overlapping the lower edge of the scene window by 24.',
      states: ['Subtitles on, the default: Spanish and English together.', 'Subtitles off: Spanish only.'],
      motion: 'A new line replaces the old with the default effects spring. The Spanish line is spoken as it appears.',
      do: ['Keep a line to two rows of text.', 'Let the player replay the audio as often as they like, outside timed checks.'],
      dont: ['Put the English first or larger than the Spanish.', 'Use the pixel face anywhere else.'],
      a11y: ['The pixel face is 22px with full accents.', 'The subtitle setting lives in Settings and is on by default.', 'Audio is never the only carrier of a line.'],
      provide: 'The speaker\'s name, the Spanish line, its English, and the text to speak.',
      source: OWN,
    },
  },
  {
    name: 'CelebrationBanner', group: 'Feedback', height: 250, subtitle: 'Papel picado for a passed check',
    html: `
<div class="pb-fiesta" id="f">
  <div class="pb-fiesta__string" id="s"></div>
  <p class="pb-fiesta__es">¡Lo lograste!</p>
  <p class="pb-fiesta__en">You can shop at the market on your own.</p>
</div>
<div class="line"><button class="pb-btn pb-btn--small pb-btn--tonal" id="again"><span data-ic="rotate-ccw" data-size="20"></span>Play it again</button></div>`,
    js: `
var C = ['wall-rosa','wall-ocre','wall-caribe','wall-purpura','wall-jade','wall-anil','wall-terracota','wall-rosa'], s = document.getElementById('s');
function draw() { s.innerHTML = C.map(function (c) { return '<i class="pb-fiesta__flag" style="background:var(--' + c + ')"></i>'; }).join(''); }
draw(); document.getElementById('again').addEventListener('click', draw);`,
    doc: {
      sum: 'The celebration banner drops a string of papel picado when the player passes a place\'s can-do check or unlocks a place.',
      use: ['A passed can-do check.', 'A new place unlocked.'],
      not: ['A single correct answer. That is a green row, not a celebration.', 'More than once on a screen.'],
      anatomy: ['Container: `rosa-container`, `radius-xl`.', 'String of flags in the town\'s wall colours, each with a cut-out.', 'Spanish line in `rotulo-large`.', 'What you can now do, in English, in `title`.'],
      place: 'At the top of the results sheet. It is the screen\'s one hero moment.',
      motion: 'Flags drop and settle with the slow spatial spring, staggered by 60 ms.',
      do: ['Say what the player can now do, not how many points they earned.'],
      dont: ['Use rosa for anything that is not a celebration.'],
      a11y: ['Under reduced motion the flags appear in place with no drop.', 'The message is text, not part of the artwork.'],
      provide: 'The Spanish cheer and the can-do sentence.',
      source: OWN + ' The flags follow the papel picado tradition in general form only.',
    },
  },
  {
    name: 'MasteryToken', group: 'Controls', height: 190, subtitle: 'The shape is the state',
    html: `
<div class="line" id="l"></div>
<p class="cap">New, learning, familiar, known. A word that slips moves back a step.</p>`,
    js: `
document.getElementById('l').innerHTML = Pueblo.MASTERY.map(function (m) { return '<div class="pb-token" data-state="' + m.id + '" data-shape="' + m.shape + '">' + m.label + '</div>'; }).join('');
Pueblo.applyShapes();`,
    doc: {
      sum: 'A mastery token shows how well the player knows one Spanish word through its shape and tone.',
      use: ['The word collection on the Progress screen.', 'Beside a word in results, to show it moved up or down.'],
      not: ['Showing right or wrong. Tokens are neutral; green and red belong to answers.'],
      anatomy: ['Shape: circle, clover, cookie or sunny, 72 across.', 'Tone: `cal-container`, `outline-soft`, `ink-muted`, `ink`, from new to known.', 'The state word, in `label-small`.'],
      states: ['New.', 'Learning.', 'Familiar.', 'Known.', 'A word that is due for review steps back one shape.'],
      motion: 'The shape morphs with the default spatial spring; the tone changes with the effects spring.',
      do: ['Always show the state word with the shape.'],
      dont: ['Use more than these four shapes for mastery.', 'Give tokens the five job colours.'],
      a11y: ['State is carried by word, shape and tone together.', 'Under reduced motion the shape changes without morphing.'],
      provide: 'The state. Set `data-state` and `data-shape`.',
      source: OWN,
    },
  },
  {
    name: 'MapMarker', group: 'Navigation', height: 200, subtitle: 'A place on the town map',
    html: `
<div class="line" style="gap:4px">
  <div class="pb-marker" data-state="locked"><div class="pb-marker__shape" data-shape="circle"><span data-ic="lock"></span></div><span class="pb-marker__name">Banco</span><span class="pb-marker__state">Locked</span></div>
  <div class="pb-marker" data-state="open" style="--wall:var(--wall-ocre)"><div class="pb-marker__shape" data-shape="squircle"><span data-ic="store"></span></div><span class="pb-marker__name">Mercado</span><span class="pb-marker__state">2 of 5</span></div>
  <div class="pb-marker" data-state="open" style="--wall:var(--wall-caribe)"><div class="pb-marker__shape" data-shape="squircle"><span data-ic="car-taxi-front"></span></div><span class="pb-marker__name">Sitio</span><span class="pb-marker__state">New</span></div>
  <div class="pb-marker" data-state="mastered" style="--wall:var(--wall-maya)"><div class="pb-marker__shape" data-shape="sunny"><span data-ic="trees"></span></div><span class="pb-marker__name">Plaza</span><span class="pb-marker__state">Mastered</span></div>
</div>`,
    doc: {
      sum: 'A map marker is one place on the town map, showing whether it is locked, open or mastered.',
      use: ['The town map.'],
      not: ['Lists. Use the place card there.'],
      anatomy: ['Emblem: 72 across, in the place\'s wall colour, with the place icon.', 'Name in the rótulo face.', 'State line in `label-small`.'],
      place: 'On the map at the place\'s building.',
      states: ['Locked: neutral circle with a lock.', 'Open: squircle in the wall colour, with progress.', 'Mastered: sunny shape in the wall colour.'],
      motion: 'Unlocking morphs circle to squircle; mastering morphs squircle to sunny. This is the map\'s hero moment.',
      do: ['Use the wall colour here; the map is art, not a control surface.'],
      dont: ['Rely on the shape alone. The state line is always shown.'],
      a11y: ['Markers are 96 wide and at least 48 high to tap.', 'State is given in words.'],
      provide: 'The place, its state and its progress.',
      source: OWN,
    },
  },
  {
    name: 'PlaceCard', group: 'Navigation', height: 210, subtitle: 'A place in a list',
    html: `
<div class="pb-place" style="--wall:var(--wall-ocre)"><span class="pb-place__swatch" data-ic="store"></span><div class="pb-place__body"><p class="pb-place__name">Mercado</p><p class="pb-place__sub">4 words are slipping</p></div><span data-ic="chevron-right"></span></div>
<div class="pb-place" style="--wall:var(--wall-anil);color:var(--ink)"><span class="pb-place__swatch" style="color:var(--card)" data-ic="landmark"></span><div class="pb-place__body"><p class="pb-place__name">Banco</p><p class="pb-place__sub">Ready for its check</p></div><span data-ic="chevron-right"></span></div>`,
    doc: {
      sum: 'A place card is one place shown as a row in a list, with what is waiting for you there.',
      use: ['Today\'s errands.', 'Progress by place.'],
      not: ['The map. Use the map marker.'],
      anatomy: ['Swatch: 56 square in the wall colour with white trim and the place icon.', 'Name in `rotulo-small`.', 'One line of status in `label`.', 'Chevron.'],
      place: 'In a vertical list with a 12 gap.',
      states: ['Rest.', 'Pressed: the whole card is the target.'],
      do: ['Say what is waiting in plain words, such as "4 words are slipping".'],
      dont: ['Show a percentage as the only status.'],
      a11y: ['The whole card is one target, 80 high.', 'On dark wall colours the icon is white.'],
      provide: 'The place and its status line.',
      source: OWN + ' Follows Material 3 list and card guidance.',
    },
  },
  {
    name: 'AchievementBadge', group: 'Feedback', height: 220, subtitle: 'For something you can now do',
    html: `
<div class="pb-badge"><div class="pb-badge__shape" data-shape="burst"><span data-ic="shopping-basket" data-size="28"></span></div><div><p class="pb-badge__name">Shopped without help</p><p class="pb-badge__how">A full list at the market, no hints.</p></div></div>
<div class="pb-badge" data-earned="no"><div class="pb-badge__shape" data-shape="circle"><span data-ic="lock" data-size="24"></span></div><div><p class="pb-badge__name">Paid the exact fare</p><p class="pb-badge__how">Understand a spoken fare and pay it with no change.</p></div></div>`,
    doc: {
      sum: 'An achievement badge marks something the player can now do in Spanish.',
      use: ['Can-do checks passed and skills shown in play.'],
      not: ['Counting taps, days or points. Volume is not an achievement.'],
      anatomy: ['Emblem: burst shape in `rosa`, 64 across, with an icon.', 'Name: what you did, in `title`.', 'How: one line in `label`.'],
      place: 'On the Achievements screen and in results when first earned.',
      states: ['Earned.', 'Not yet earned: neutral circle with a lock, and the way to earn it.'],
      motion: 'Earning morphs circle to burst with the slow spatial spring.',
      do: ['Name the ability in the past tense, as something done.'],
      dont: ['Hide how a badge is earned.'],
      a11y: ['Earned and unearned differ by shape, icon and tone.'],
      provide: 'The name, the how line, an icon and whether it is earned.',
      source: OWN,
    },
  },
  {
    name: 'AccentKeys', group: 'Controls', height: 230, subtitle: 'Try it: type with accents',
    html: `
<label class="pb-field"><span class="pb-field__label">Type it in Spanish</span><input class="pb-field__input" id="t" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="carrots"></label>
<div class="pb-keys" data-keys data-for="t" data-max="40">
  <button class="pb-key" data-key="á">á</button><button class="pb-key" data-key="é">é</button><button class="pb-key" data-key="í">í</button><button class="pb-key" data-key="ó">ó</button><button class="pb-key" data-key="ú">ú</button><button class="pb-key" data-key="ñ">ñ</button><button class="pb-key" data-key="¿">¿</button><button class="pb-key" data-key="¡">¡</button>
</div>`,
    doc: {
      sum: 'Accent keys are a row of Spanish characters that sits above the keyboard so the player can type á, ñ, ¿ and the rest in one tap.',
      use: ['With every typing field that takes Spanish.'],
      not: ['Fields that take numbers or English.'],
      anatomy: ['Eight keys: á é í ó ú ñ ¿ ¡.', 'Each key: `card`, `radius-md`, 48 square, `word` style.'],
      place: 'Directly under the typing field, above the device keyboard.',
      states: ['Rest.', 'Pressed: shrinks and rounds.'],
      motion: 'Fast spatial spring on press.',
      do: ['Accept an answer typed without accents as nearly right, and show the accented form.'],
      dont: ['Hide the keys behind a long-press.'],
      a11y: ['Keys are 48 square with an 8 gap.', 'Each key is a real button with its character as the label.'],
      provide: 'The id of the field to type into, in `data-for`.',
      source: OWN,
    },
  },
  {
    name: 'NumberPad', group: 'Controls', height: 420, subtitle: 'Try it: key in the amount you hear',
    html: `
<div class="pb-talk"><div class="pb-dialogue"><p class="pb-dialogue__es">Mil doscientos cincuenta pesos.</p><p class="pb-dialogue__en">1,250 pesos.</p></div><button class="pb-iconbtn pb-iconbtn--tonal" aria-label="Hear it again" data-say="Mil doscientos cincuenta pesos"><span data-ic="volume-2"></span></button></div>
<div class="pb-amount" id="a" aria-live="polite"></div>
<div class="pb-numpad" data-keys data-for="a" data-max="6" style="margin:0 auto">
  <button class="pb-key" data-key="1">1</button><button class="pb-key" data-key="2">2</button><button class="pb-key" data-key="3">3</button>
  <button class="pb-key" data-key="4">4</button><button class="pb-key" data-key="5">5</button><button class="pb-key" data-key="6">6</button>
  <button class="pb-key" data-key="7">7</button><button class="pb-key" data-key="8">8</button><button class="pb-key" data-key="9">9</button>
  <span></span><button class="pb-key" data-key="0">0</button><button class="pb-key" data-key="back" aria-label="Delete"><span data-ic="delete"></span></button>
</div>`,
    doc: {
      sum: 'The number pad lets the player key in an amount they heard or read in Spanish.',
      use: ['The bank, checkout totals, fares, times.'],
      not: ['Typing words. Use the typing field with accent keys.'],
      anatomy: ['Amount display: `ocre-ink`, display size, with a peso sign.', 'Keys 0 to 9 and delete, 56 high, in a three-column grid.'],
      place: 'In the challenge area, with the spoken amount in the dialogue box above.',
      states: ['Empty: shows a faint zero.', 'Filled, to a maximum length.'],
      motion: 'Fast spatial spring on each key press.',
      do: ['Hide the subtitle\'s numerals during a can-do check, since they give the answer away.'],
      dont: ['Use the device keyboard for amounts; it covers the scene.'],
      a11y: ['Keys are 56 high.', 'The amount is announced as it changes.'],
      provide: 'The id of the amount display in `data-for` and a maximum length in `data-max`.',
      source: OWN,
    },
  },
  {
    name: 'HintChips', group: 'Feedback', height: 190, subtitle: 'A line decoded word by word',
    html: `
<div class="pb-decode">
  <div class="pb-decode__w"><b>¿Qué</b><span>what</span></div><div class="pb-decode__w"><b>va</b><span>are you going</span></div><div class="pb-decode__w"><b>a</b><span>to</span></div><div class="pb-decode__w"><b>llevar?</b><span>take</span></div>
</div>
<p class="cap">Shown in the hint sheet. A hint costs a little.</p>`,
    doc: {
      sum: 'Hint chips break one Spanish line into its words, each with its literal English beneath.',
      use: ['The hint sheet, when the player asks for help with a line.'],
      not: ['Showing by default. A hint is asked for.', 'During a can-do check.'],
      anatomy: ['One chip per word: `cal-low`, `radius-md`.', 'Spanish in `word` style above, English in `label` below.'],
      place: 'In a bottom sheet over the challenge.',
      do: ['Give the literal meaning, so the player sees how the Spanish is built.'],
      dont: ['Give the natural English translation here; that is the subtitle\'s job.'],
      a11y: ['Chips wrap; no horizontal scrolling.', 'Each chip reads as "Spanish, meaning".'],
      provide: 'The words and their literal meanings.',
      source: OWN,
    },
  },
];
