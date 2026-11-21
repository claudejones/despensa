Pueblo is the design system for a mobile game set in a Yucatán-peninsula town, where you learn Spanish by shopping, paying, travelling and talking. Material 3 Expressive supplies the controls and motion; pixel art supplies the town.

## Colour

Five colours have five jobs. Keep each job on its colour and never lend the colour to anything else.

- Use `cobalto` with `on-cobalto` for the one thing to do next: the primary button, the selected state, a link. One cobalt button per screen.
- Use `nopal` for correct, with a check icon and the word. As text, use `nopal-ink`.
- Use `cochinilla` for wrong, with an x icon and the word. Nothing else in the game is red.
- Use `ocre` for money only: coins, prices, the budget chip. As text, use `ocre-ink`.
- Use `rosa` for celebration only: a passed check, a place unlocked.
- Set pages on `cal`, rows on `cal-low`, empty slots on `cal-container`, cards and the dialogue box on `card`. Set text in `ink`, secondary text and subtitles in `ink-muted`.
- The `wall-*` colours belong to the pixel art and the map. Never use them on a control.
- Every status carries an icon and a word. `nopal` and `cochinilla` also differ in lightness, so they hold up without colour vision.
- Light theme only.

## Type

- Set place names in `rotulo-large` or `rotulo-small`. Nothing else uses the rótulo face.
- Set what a townsperson says in `dialogue`, inside the speech box. It is the same rounded face and size as a Spanish word tile, because it is the Spanish the player is learning to read.
- Set Spanish you are learning in `word` or larger: tiles, filled slots, the primary button.
- Set everything else in the interface styles: `headline`, `title`, `body`, `label`, `label-small`. Never set Spanish content in `label-small`.
- Spanish game content always shows its accents and opening marks: ¿ ¡ á é í ó ú ü ñ.

## The picture rule

A picture or icon sits only beside the English. Spanish answers are text only. If a screen can be solved without reading the Spanish, it is wrong.

## Shape and motion

- Controls use the radius scale. Buttons are `radius-full` and square off to a 12 corner when pressed; cards and the scene window are `radius-xl`; tiles `radius-md`.
- Things you move (tiles, coins, sliders) use the spatial springs in `bundle.css` and may overshoot. Colour and opacity use the effects springs and never bounce.
- Use the shape set (`Pueblo.shape(name)` or `data-shape`) for word tokens, place emblems and celebration only, never for a container that holds a sentence.
- A word's mastery token changes shape with its state: circle for new, clover for learning, cookie for familiar, sunny for known. Always show the state word with it.
- One hero moment per screen.
- Respect reduced motion: replace every spring with a plain change.

## Pixels and Material

- Characters, scenes and item pictures are pixel art. Type is never pixel type.
- Controls, sheets and progress are Material. No pixels in a button, no Material shapes inside a scene.
- A pixel-art picture sits straight on its row with no tile behind it.

## Overlays

Use the lightest one that does the job.

- Info tip: one or two sentences about a thing on screen, opened by its info button.
- Snackbar: something just happened; at most one action, such as Undo.
- Bottom sheet: hints, results, short choices. It rises over the screen and can be dragged away.
- Dialog: only to confirm something that cannot be undone, such as leaving a check or resetting progress.
- Side sheet: on wide screens, what would be a bottom sheet or a whole settings screen on a phone opens as a panel at the trailing edge.
- One overlay at a time. Every overlay can be closed without a gesture.
- Nothing is ever locked. Suggest a next step instead.

## Building a screen

- Follow the scaffold top to bottom: top bar, the encounter (character on the left, speech on the right), the challenge, one primary button. The bottom bar hides during a challenge.
- One filled cobalt button per screen, 56 high, at the bottom.
- Every touch target is at least 48 high, even where the visible control is 40.
- Hints and results rise in a bottom sheet. Use a dialog only to confirm something that cannot be undone.
- State the amount, the quantity or the request in Spanish in the dialogue box; the player answers with tiles, the slider, coins, the number pad or the typing field.
- Each component's own page says where it follows Material 3 and where it departs.

## Iconography

Icons are Lucide, embedded in the bundle as SVG. Call `Pueblo.icon(name, size)` or add `data-ic="name"` to an element. One colour for status-free icons: `ink`. No emoji anywhere.
