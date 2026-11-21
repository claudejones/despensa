The dialogue box shows what a townsperson says in Spanish, with an English subtitle beneath it.

## When to use

- Every line a character speaks, including instructions given in character.

## When not to use

- Interface instructions such as "Drag the word". Those are plain `body` text.

## Anatomy

- Box: `card`, `radius-lg-inc`, soft shadow.
- Name: `label-small` in `ink-muted`.
- Spanish line: `dialogue` style, the pixel face.
- English subtitle: `label` in `ink-muted`.
- Speaker button beside the box.

## Placement

Overlapping the lower edge of the scene window by 24.

## States

- Subtitles on, the default: Spanish and English together.
- Subtitles off: Spanish only.

## Motion

A new line replaces the old with the default effects spring. The Spanish line is spoken as it appears.

## Do and don't

- Do: Keep a line to two rows of text.
- Do: Let the player replay the audio as often as they like, outside timed checks.
- Don't: Put the English first or larger than the Spanish.
- Don't: Use the pixel face anywhere else.

## Accessibility

- The pixel face is 22px with full accents.
- The subtitle setting lives in Settings and is on by default.
- Audio is never the only carrier of a line.

## What you provide

The speaker's name, the Spanish line, its English, and the text to speak.

## Source

Pueblo original. Uses Material 3 colour roles, the corner radius scale and the Expressive springs.
