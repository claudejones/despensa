A bottom sheet brings up extra content over the current screen without leaving it.

## When to use

- Hints.
- Results after a challenge.
- Short forms and filters.

## When not to use

- Confirming something that cannot be undone. Use a dialog.
- Content the player needs all the time.

## Anatomy

- Container: `card`, top corners `radius-xl`, at most 640 wide.
- Drag handle: 32 by 4 in `outline`, in a 48 high grab zone.
- Title in `headline`.
- One closing action at the bottom.

## Placement

Rises from the bottom edge to at most half the screen, then pulls up to full height. A scrim covers the screen behind a modal sheet. On wide screens it becomes a side sheet.

## States

- Closed.
- Open.
- Dragged.

## Motion

Rises with the default spatial spring. The scrim fades with the effects spring.

## Do and don't

- Do: Let the player dismiss it by dragging down, tapping the scrim, or the closing button.
- Don't: Stack a sheet on a sheet.

## Accessibility

- Focus moves into the sheet and returns when it closes.
- It can always be closed without dragging.

## What you provide

The title, the content and the closing action.

## Source

Material 3 bottom sheet: 32 by 4 drag handle with 22 above and below, 640 maximum width, modal sheets open to half height. Read 2026-11-21. Top corner radius was shown only as a graphic; 28 is used.
