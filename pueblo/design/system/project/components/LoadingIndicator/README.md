The loading indicator shows the game is working during a short wait.

## When to use

- Waits between about 200 milliseconds and 5 seconds.

## When not to use

- Longer waits. Use a progress bar that shows how far along it is.
- Waits under 200 milliseconds. Show nothing.

## Anatomy

- One 38 shape in `cobalto`, in a 48 box, that keeps morphing through the shape set while turning.
- An optional line saying what is happening.

## Placement

Centred in the area that is loading.

## Motion

Morphs with the slow spatial spring every 700 ms.

## Do and don't

- Do: Say what is loading when the wait is over a second.
- Don't: Cover the whole screen for a partial load.

## Accessibility

- Under reduced motion it is a still shape with the text.
- The text is announced.

## What you provide

An optional message.

## Source

Material 3 loading indicator: 38 shape in a 48 box, for waits of 200 ms to 5 s, loops through shape morphs. Read 2026-11-21. Departure: it morphs through Pueblo's own six shapes; Material's seven are not published for web.
