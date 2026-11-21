A blank slot is the empty space beside an English prompt that a Spanish tile goes into.

## When to use

- Every place the player must supply Spanish.

## When not to use

- Free typing. Use the typing field for that.

## Anatomy

- Container: `cal-container` with a 2px dashed `outline` border, `radius-lg`, 48 high, at least 132 wide.
- Content: the placed tile's text in `word` style.

## Placement

At the right end of a list row, or in a line of slots for building a sentence.

## States

- Empty.
- Filled: `cobalto-container`.
- Correct: `nopal` with a check icon.
- Wrong: `cochinilla` with an x icon.

## Motion

The tile lands with the default spatial spring. Colour changes use the effects spring and do not bounce.

## Do and don't

- Do: Show correct and wrong only after the player checks.
- Don't: Size the blank to the answer's length. That gives the answer away.

## Accessibility

- The dashed border meets 3:1 against the page.
- Correct and wrong always carry an icon as well as colour.

## What you provide

`data-answer` with the expected Spanish.

## Source

Pueblo original. Uses Material 3 colour roles, the corner radius scale and the Expressive springs.
