The typing field is where the player writes a Spanish word or phrase from memory.

## When to use

- The typing rung of a challenge, after matching is mastered.

## When not to use

- Amounts. Use the number pad.
- A first meeting with a word. Start with matching.

## Anatomy

- Label: the English prompt, above the field.
- Field: `card` with a 2px `outline` border, `radius-md`, 56 high, text in `word` style.
- Help line beneath for the result.
- Accent keys directly under it.

## Placement

In the challenge area. The primary button stays visible above the keyboard.

## States

- Empty.
- Focus: 3px `cobalto` border.
- Correct.
- Nearly: right letters, missing accent; shown in ink with the accented form.
- Wrong.

## Do and don't

- Do: Accept an answer without accents as nearly right and show the correct form.
- Do: Turn off autocorrect and autocapitalise.
- Don't: Use the placeholder as the only label.

## Accessibility

- The label is always visible.
- Results carry an icon and words.
- Text is 22px.

## What you provide

The English prompt, the expected Spanish and the state.

## Source

Material 3 outlined text field: 56 high, 16 side padding, label always visible. Read 2026-11-21. Departures: the label sits above the field as the English prompt instead of floating inside it; input text is 22/28 where Material uses 16/24, because it is the Spanish being learned.
