A snackbar tells the player something just happened and offers at most one action.

## When to use

- Confirming a small action, with an Undo where possible.

## When not to use

- Right or wrong feedback. That belongs on the answer itself.
- Anything the player must read to continue.

## Anatomy

- Container: `ink`, `radius-md`, 48 high.
- Message in `label`, in `cal`.
- One text action. No icon.

## Placement

Above the primary button, never over the bottom bar.

## Motion

Slides up with the default spatial spring. Without an action it leaves after 4 to 10 seconds; with one it stays until dismissed.

## Do and don't

- Do: Keep it to one line.
- Don't: Add an icon.
- Don't: Show two at once.

## Accessibility

- Announced politely to screen readers.
- Stays long enough to read, and longer if it has an action.

## What you provide

The message and an optional action.

## Source

Material 3 snackbar: 48 high for one line, one text action, no icon, never over navigation. Read 2026-11-21. Corner radius and padding were shown only as graphics.
