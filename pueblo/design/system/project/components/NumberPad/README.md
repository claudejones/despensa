The number pad lets the player key in an amount they heard or read in Spanish.

## When to use

- The bank, checkout totals, fares, times.

## When not to use

- Typing words. Use the typing field with accent keys.

## Anatomy

- Amount display: `ocre-ink`, display size, with a peso sign.
- Keys 0 to 9 and delete, 56 high, in a three-column grid.

## Placement

In the challenge area, with the spoken amount in the dialogue box above.

## States

- Empty: shows a faint zero.
- Filled, to a maximum length.

## Motion

Fast spatial spring on each key press.

## Do and don't

- Do: Hide the subtitle's numerals during a can-do check, since they give the answer away.
- Don't: Use the device keyboard for amounts; it covers the scene.

## Accessibility

- Keys are 56 high.
- The amount is announced as it changes.

## What you provide

The id of the amount display in `data-for` and a maximum length in `data-max`.

## Source

Pueblo original. Uses Material 3 colour roles, the corner radius scale and the Expressive springs.
