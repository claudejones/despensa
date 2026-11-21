Chat bubbles keep the earlier lines of a conversation on screen so the player can follow the thread.

## When to use

- Conversations of more than two turns.

## When not to use

- The current line. That is in the encounter, with its speaker button.

## Anatomy

- Theirs: `card`, at the left. Yours: `cobalto-container`, at the right.
- Speaker name in `label-small`, the line in `title`.
- At most the last three lines; older ones scroll away.

## Placement

Between the encounter and the reply tiles.

## Motion

A new bubble rises in with the default spatial spring.

## Do and don't

- Do: Show your own lines as you said them.
- Don't: Add English to past bubbles during a check.

## Accessibility

- Read in order as a list of who said what.

## What you provide

The lines so far and who said each.

## Source

Pueblo original. Uses Material 3 colour roles, the corner radius scale and the Expressive springs.
