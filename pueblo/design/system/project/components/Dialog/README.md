A dialog interrupts to confirm a choice that cannot be undone.

## When to use

- Resetting progress.
- Leaving a can-do check part way.

## When not to use

- Hints, results or anything routine. Use a bottom sheet.
- Errors the player can simply fix.

## Anatomy

- Container: `card`, `radius-xl`, 24 padding, 280 to 560 wide.
- Optional icon, title in `headline`, text in `body`.
- Two actions at the lower right: the safe one as text, the committing one filled.

## Placement

Centred over a scrim.

## Motion

Appears with the default effects spring; no bounce.

## Do and don't

- Do: Name the actions for what they do: "Reset", "Keep my progress".
- Don't: Use "OK" and "Cancel".
- Don't: Colour the committing action red; say what it does in words instead.

## Accessibility

- Focus is trapped in the dialog.
- Escape and the safe action both close it.

## What you provide

The title, the consequence in one or two sentences, and the two action labels.

## Source

Material 3 basic dialog: 28 corners, 280 to 560 wide, 24 padding, 16 between icon, title and text, 24 above the actions, two actions at most. Read 2026-11-21. Departure: supporting text is 16/24 where Material uses 14/20.
