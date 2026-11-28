The scene window is a framed pixel-art view of a place with no speech, for moments that are about the place itself.

## When to use

- The title screen and a place's first-visit view.
- When a character is speaking, use the encounter instead.

## When not to use

- The town map, which is its own full-screen scene.

## Anatomy

- Frame: `radius-xl`, 196 high, full width inside the 16 gutters.
- Scene: pixel art, scaled by whole multiples and never smoothed.
- Character: centred, with expression sprites.
- Heads-up items: patience top left.

## Placement

Directly under the top bar. The dialogue box overlaps its lower edge by 24.

## States

- One wall colour per place, set with `data-place`.
- The character's expression: neutral, talking, happy, confused, impatient, surprised.

## Motion

Expression changes are a sprite swap with no tween. The scene itself does not move during a challenge.

## Do and don't

- Do: Keep everything the player must read outside the scene.
- Don't: Put Material controls or shapes inside the scene.
- Don't: Put the things being asked for in the scene as pictures next to Spanish labels.

## Accessibility

- The scene is decorative; give it a short label such as "The market".
- Nothing the player needs is shown only in the scene.

## What you provide

The place, the scene art and the character sprite sheet. Until art exists, the flat-block placeholder stands in.

## Source

Pueblo original. Uses Material 3 colour roles, the corner radius scale and the Expressive springs.
