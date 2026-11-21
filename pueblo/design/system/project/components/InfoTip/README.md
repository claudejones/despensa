An info tip explains one thing on the screen when the player asks.

## When to use

- Explaining a game idea the first time it appears: patience, hints, tokens.

## When not to use

- Translating Spanish. That is the hint sheet.
- Anything the player must know to proceed; say that on the screen.

## Anatomy

- Info icon button as the trigger.
- Tip: `cal-container`, `radius-md`, a title in `label` and one or two sentences.

## Placement

Anchored to its trigger, inside the screen edges.

## States

- Hidden.
- Shown until dismissed.

## Motion

Appears with the fast effects spring.

## Do and don't

- Do: Keep it to two sentences.
- Don't: Open a tip automatically more than once.

## Accessibility

- Opens on tap and on keyboard focus, never on hover alone.
- The trigger says what it explains.

## What you provide

The title and the text.

## Source

Material 3 rich tooltip: 12 top, 8 bottom and 16 side padding, never for critical information. Read 2026-11-21. Departure: it opens on tap and stays until dismissed, where Material opens on hover or long-press.
