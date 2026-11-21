An icon button is a compact control for a familiar action shown by an icon alone.

## When to use

- Back, hear again, info, settings, pause.

## When not to use

- The primary action. That is always a labelled button.
- An action whose icon is not obvious.

## Anatomy

- 40 visible with a 24 icon and a 48 touch target; a 56 size for the main speaker button.
- Standard: no container. Tonal: `cobalto-container`. Filled: `cobalto`.

## Placement

In the top bar, beside the dialogue box, or inside a row.

## States

- Rest.
- Pressed: the circle squares off to an 8 corner (12 on the large size).
- Focus: `ink` ring.

## Motion

Fast spatial spring on press.

## Do and don't

- Do: Give every icon button a spoken label.
- Don't: Use an icon button for something destructive.

## Accessibility

- Touch target is 48 even where the visible button is 40.
- `aria-label` says what it does.

## What you provide

The icon, the variant and the label.

## Source

Material 3 icon button, sizes S (40, 24 icon) and M (56, 24 icon), 48 target, pressed corners 8 and 12. Read 2026-11-21.
