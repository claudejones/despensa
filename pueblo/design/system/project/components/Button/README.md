A button starts an action; the filled cobalt button is the one thing to do next on a screen.

## When to use

- Filled: the single primary action, such as Check or Go to checkout.
- Tonal: a helpful second action.
- Outline and text: low-emphasis choices.

## When not to use

- Choosing among options. Use a button group.
- Navigation between main screens. Use the bottom bar.

## Anatomy

- Container: `radius-full`. Primary is 56 high with 24 side padding; small is 40 high with 16.
- Label: `word` style on the primary, `title` on the others.
- One optional icon.

## Placement

The primary button sits at the bottom of the screen, full width inside the gutters.

## States

- Rest.
- Pressed: the pill squares off to a 12 corner (8 on small).
- Focus: 3px `ink` ring.
- Disabled: `cal-container` with `ink-muted` label.

## Motion

Fast spatial spring on press. The shape change is the feedback.

## Do and don't

- Do: Keep labels to one to three words.
- Do: Disable Check until the task can be checked, and say why in the hint line.
- Don't: Show two filled buttons on one screen.
- Don't: Use cobalt for anything that is not an action.

## Accessibility

- The primary button is 56 high. Small buttons are 40 high with a 48 touch target.
- Label contrast is at least 4.5:1 in every variant.

## What you provide

The label, the variant and size, and an optional icon.

## Source

Material 3 button, sizes M (56 high, 24 padding, 24 icon) and S (40 high, 16 padding, 48 target); pressed corners 12 and 8. Read 2026-11-21. Departures: the primary label is 22/28 (Material's label style for size M was not readable on the page); the disabled button uses solid neutral tones instead of 10% and 38% opacity, for contrast.
