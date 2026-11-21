An answer line is the space where the player arranges tiles, in order, into a Spanish sentence.

## When to use

- Building a sentence from an English prompt.
- Ordering syllables at the school.

## When not to use

- Matching single words to a list. Use blank slots.

## Anatomy

- Zone: `card` with a 2px dashed `outline` border, `radius-lg`, at least two rows of tiles high.
- Tiles sit in the order placed and can be dragged to reorder.
- The tile tray beneath holds the remaining words, with one or two that do not belong.

## Placement

Under the English prompt, above the tile tray.

## States

- Empty.
- Filling.
- Correct: `nopal-container` with a solid border.
- Wrong: `cochinilla-container`; the misplaced tiles shake once.

## Motion

Tiles make room for a dragged tile with the fast spatial spring.

## Do and don't

- Do: Accept every correct word order, not just one.
- Don't: Show the number of blanks; that gives away the sentence length.

## Accessibility

- Tap a tile to add it to the end; tap it in the line to send it back.
- The result is announced in words.

## What you provide

The English prompt, the tiles, and every accepted order.

## Source

Pueblo original. Uses Material 3 colour roles, the corner radius scale and the Expressive springs.
