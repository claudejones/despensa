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
- Set what a townsperson says in `dialogue`, inside the dialogue box only.
- Set everything else in the interface styles: `headline`, `title`, `body`, `label`.
- Spanish game content always shows its accents and opening marks: ¿ ¡ á é í ó ú ü ñ.

## The picture rule

A picture or icon sits only beside the English. Spanish answers are text only. If a screen can be solved without reading the Spanish, it is wrong.

## Shape and motion

- Controls use the radius scale. Buttons are `radius-full`, cards and the scene window `radius-xl`, tiles `radius-md`.
- Things you move (tiles, coins, sliders) use the spatial springs in `bundle.css` and may overshoot. Colour and opacity use the effects springs and never bounce.
- One hero moment per screen.
- Respect reduced motion: replace every spring with a plain change.

## Pixels and Material

- Characters and scenes are pixel art inside the scene window.
- Controls, sheets and progress are Material. No pixels in a button, no Material shapes inside a scene.

## Iconography

Icons are Lucide, embedded in the bundle as SVG. Call `Pueblo.icon(name, size)` or add `data-ic="name"` to an element. One colour for status-free icons: `ink`. No emoji anywhere.
