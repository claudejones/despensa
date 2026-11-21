A list row pairs one English prompt and its icon with one blank slot.

## When to use

- Shopping lists, menus, symptoms, tasks: any set of things to say in Spanish.

## When not to use

- Showing Spanish on the left. The left side is always the side you already understand.

## Anatomy

- Picture: a line icon on a 44 square `cal-low` tile, or a pixel-art picture straight on the row with no tile (`pb-listrow__pic--art`).
- English: `title` style, with an optional quantity line in `label`.
- Blank slot on the right.
- Rows sit inside one `card` container with `radius-xl`.

## Placement

In the challenge area, under the dialogue box.

## States

- Rest.
- Correct: `nopal-container` row with the word "Correct".
- Wrong: `cochinilla-container` row with "Not this one".

## Do and don't

- Do: Use an icon only when it is unambiguous.
- Do: Keep a list to six rows or fewer on one screen.
- Don't: Reveal the right answer in a wrong row until the player has tried again.

## Accessibility

- Each result carries a word, an icon and a colour.
- Rows are 64 high.

## What you provide

English text, an icon name, an optional quantity, and the slot's answer.

## Source

Pueblo original. Uses Material 3 colour roles, the corner radius scale and the Expressive springs.
