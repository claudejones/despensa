An encounter puts a townsperson and what they are saying side by side in one band at the top of the screen.

## When to use

- Every screen where a character speaks: a place's home, each challenge, results.

## When not to use

- Screens with no character, such as Progress or Settings.

## Anatomy

- Band: `radius-xl`, in the place's wall colour under a strip of sky, at least 148 high (196 for the tall size).
- Character: a pixel-art portrait at the left, 111 by 116, standing on the band's lower edge.
- Speech box at the right, vertically centred.
- Speaker button on the speech box's lower right corner.
- Patience meter, when timed, at the top right.

## Placement

Directly under the top bar, inside the 16 gutters.

## States

- The character's expression: neutral, talking, happy, confused, impatient, surprised.
- One wall colour per place, set with `data-place`.

## Motion

A new line replaces the old with the default effects spring. Expressions are a sprite swap with no tween.

## Do and don't

- Do: Keep a line to two rows of Spanish.
- Do: Use the compact size during a challenge so the task has room.
- Don't: Cover the character with the speech box.
- Don't: Put anything the player must act on inside the band.

## Accessibility

- The portrait has the character's name as its label.
- The speaker button has a 48 touch target.

## What you provide

The place, the character's sprite and name, the Spanish line, its English and the text to speak.

## Source

Pueblo original. Uses Material 3 colour roles, the corner radius scale and the Expressive springs.
