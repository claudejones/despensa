A word tile is one Spanish word or short phrase that you pick up and place.

## When to use

- Any answer the player chooses or arranges: matching, building a sentence, replying.

## When not to use

- English text. English is never a tile.
- Anything with a picture. A tile is text only, which is the picture rule.

## Anatomy

- Container: `cobalto-container`, `radius-md`, 48 high.
- Label: `word` style in `on-cobalto-container`.

## Placement

In a tile tray, or inside a blank slot once placed.

## States

- Rest.
- Pressed: grows, tilts 2 degrees, corners round to `radius-lg-inc`.
- Picked: 3px `cobalto` outline.
- Placed: takes the slot's colours.

## Motion

Fast spatial spring on press; default spatial spring when it lands.

## Do and don't

- Do: Keep a tile to one to three words.
- Do: Show accents and opening marks exactly.
- Don't: Put an icon or picture on a tile.
- Don't: Colour a tile green or red before the player checks.

## Accessibility

- 48 high touch target.
- Tap a tile then tap a blank as the alternative to dragging.
- The outline, not colour alone, marks the picked tile.

## What you provide

The Spanish text, and `data-word` with the same text for checking.

## Source

Pueblo original. Uses Material 3 colour roles, the corner radius scale and the Expressive springs.
