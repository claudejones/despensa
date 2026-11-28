A switch turns one setting on or off with immediate effect.

## When to use

- Settings: English subtitles, timed replies, sound, reduced motion.

## When not to use

- Choosing between two named options. Use a button group.
- Anything that needs a Save step.

## Anatomy

- Track 52 by 32.
- Handle: 16 when off, 24 when on, 28 while pressed.
- On: `cobalto` track. Off: `cal-container` track with an `outline` border.

## Placement

At the right end of a settings row.

## States

- Off.
- On.
- Pressed.
- Focus.

## Motion

The handle slides and grows with the fast spatial spring.

## Do and don't

- Do: Label the row with the thing being switched, not "Enable".
- Don't: Use a switch without a visible label beside it.

## Accessibility

- The whole row is the target.
- It is a real checkbox, so it reads as on or off.

## What you provide

The setting's name and state.

## Source

Material 3 switch: 52 by 32 track with a 2 outline, handle 16 off, 24 on, 28 pressed, 48 target. Read 2026-11-21.
