A mastery token shows how well the player knows one Spanish word through its shape and tone.

## When to use

- The word collection on the Progress screen.
- Beside a word in results, to show it moved up or down.

## When not to use

- Showing right or wrong. Tokens are neutral; green and red belong to answers.

## Anatomy

- Shape: circle, clover, cookie or sunny, 72 across.
- Tone: `cal-container`, `outline-soft`, `ink-muted`, `ink`, from new to known.
- The state word, in `label-small`.

## States

- New.
- Learning.
- Familiar.
- Known.
- A word that is due for review steps back one shape.

## Motion

The shape morphs with the default spatial spring; the tone changes with the effects spring.

## Do and don't

- Do: Always show the state word with the shape.
- Don't: Use more than these four shapes for mastery.
- Don't: Give tokens the five job colours.

## Accessibility

- State is carried by word, shape and tone together.
- Under reduced motion the shape changes without morphing.

## What you provide

The state. Set `data-state` and `data-shape`.

## Source

Pueblo original. Uses Material 3 colour roles, the corner radius scale and the Expressive springs.
