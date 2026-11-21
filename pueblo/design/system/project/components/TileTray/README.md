A tile tray holds the Spanish tiles the player chooses from, and with a list above it forms the matching challenge.

## When to use

- Matching Spanish to English prompts.
- Holding the word bank for building a sentence.

## When not to use

- More than about eight tiles. Past that, split the challenge.

## Anatomy

- Container: `cal-low`, `radius-xl`.
- Label: the place's name for the bank, such as "The stalls".
- Tiles wrap in rows with an 8 gap.

## Placement

Directly under the list, above the primary button.

## States

- Tiles leave the tray when placed and return when tapped in their slot.

## Motion

A dragged tile follows the finger with no easing, then lands with the default spatial spring.

## Do and don't

- Do: Include one or two wrong tiles so matching is not solved by elimination.
- Do: Shuffle the tiles on every visit.
- Don't: Put pictures in the tray.
- Don't: Order the tiles to match the list.

## Accessibility

- Dragging always has a tap alternative: tap a tile, then tap a blank.
- The Check button stays disabled until every blank is filled.

## What you provide

The tiles, each with `data-word`. Call `Pueblo.match(root)`; it returns `check()` and `reset()` and fires `pb-change`.

## Source

Pueblo original. Uses Material 3 colour roles, the corner radius scale and the Expressive springs.
