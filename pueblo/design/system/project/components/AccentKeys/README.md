Accent keys are a row of Spanish characters that sits above the keyboard so the player can type á, ñ, ¿ and the rest in one tap.

## When to use

- With every typing field that takes Spanish.

## When not to use

- Fields that take numbers or English.

## Anatomy

- Eight keys: á é í ó ú ñ ¿ ¡.
- Each key: `card`, `radius-md`, 48 square, `word` style.

## Placement

Directly under the typing field, above the device keyboard.

## States

- Rest.
- Pressed: shrinks and rounds.

## Motion

Fast spatial spring on press.

## Do and don't

- Do: Accept an answer typed without accents as nearly right, and show the accented form.
- Don't: Hide the keys behind a long-press.

## Accessibility

- Keys are 48 square with an 8 gap.
- Each key is a real button with its character as the label.

## What you provide

The id of the field to type into, in `data-for`.

## Source

Pueblo original. Uses Material 3 colour roles, the corner radius scale and the Expressive springs.
