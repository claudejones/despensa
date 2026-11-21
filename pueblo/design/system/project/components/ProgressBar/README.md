A progress bar shows how far through a challenge you are, or how much of a place you know.

## When to use

- Steps within a challenge.
- A place's share of known words, on the Progress screen.

## When not to use

- Waiting. Use the loading indicator.
- Patience. Use the patience meter.

## Anatomy

- 8 high, `radius-full`.
- Fill: `ink`. Track: `cal-container`.
- Stepped version: one segment per step with a 4 gap.

## Placement

Under the top bar for steps; inside a place card or the Progress screen for knowledge.

## Motion

The fill grows with the default spatial spring.

## Do and don't

- Do: Pair it with the number in words, such as "3 of 8".
- Don't: Colour progress green. Green means a correct answer.

## Accessibility

- Give it a text value.
- The fill meets 3:1 against its track.

## What you provide

The value, and the number of steps for the stepped version.

## Source

Pueblo original. Material's progress indicator is for waiting, so this is not one; it borrows the rounded track only.
