The bottom bar moves between the four main parts of the game: Town, Errands, Progress and Phrasebook.

## When to use

- The four top-level screens.

## When not to use

- Inside a challenge or a conversation. It hides so nothing competes with the task.

## Anatomy

- 64 high. Four items, each a 24 icon in a 56 by 32 pill and a label in `label-small`.
- Active item: `cobalto-container` pill, heavier icon, bold label in `ink`.
- Badge: a count in `ink`, 16 high, used on Errands for words waiting.

## Placement

Bottom of the screen, full width, on `cal-low`. A rail on the left at 600 wide and above.

## States

- Active.
- Inactive.
- With a count badge.

## Motion

The pill grows out from the icon's centre with the fast spatial spring when chosen.

## Do and don't

- Do: Always show labels.
- Don't: Add a fifth item.
- Don't: Colour the badge red; red means a wrong answer.

## Accessibility

- Each item is at least 48 high.
- The active item is marked with `aria-current`.
- The badge count is read with the label.

## What you provide

Which item is active, and the Errands count.

## Source

Material 3 flexible navigation bar: 64 high, 24 icons, 56 by 32 indicator, three to five labelled destinations. Read 2026-11-21. Departures: Material marks the active item with a filled icon, Lucide has no filled set so the stroke is heavier; the badge is ink where Material uses its error colour, because red is reserved for wrong answers.
