A button group offers two to four choices where exactly one is chosen.

## When to use

- Rating how saying a line aloud went.
- Either-or settings shown inline, such as who is speaking.

## When not to use

- More than four options. Use a list.
- A plain on or off. Use a switch.

## Anatomy

- Segments 40 high with a 2 gap and a 48 touch target.
- Unselected: `cal-container`, 8 inner corners.
- Selected: `cobalto`, fully rounded.

## Placement

In the challenge area or a settings row.

## States

- Unselected.
- Selected.
- Pressed: the segment's corners tighten to 4.

## Motion

Fast spatial spring on press and on selection.

## Do and don't

- Do: Pair faces with words when rating; a face alone is ambiguous.
- Don't: Use green and red for the rating. This is a self-report, not a marked answer.

## Accessibility

- Each segment is a button with `aria-pressed`.
- The group has a label.

## What you provide

The options and which is selected.

## Source

Material 3 connected button group, size S: 40 high, 2 gap, 8 inner corners, 4 when pressed, selected fully rounded, 48 target. Read 2026-11-21.
