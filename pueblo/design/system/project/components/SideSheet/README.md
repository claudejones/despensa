A side sheet is a panel at the trailing edge of a wide screen that holds what would be a bottom sheet or a whole screen on a phone.

## When to use

- Settings, the phrasebook, a hint or a word's details, on screens 600 wide and up.
- Standard: content that sits beside the main screen and stays open.
- Modal: content that must be dealt with or closed, over a scrim.

## When not to use

- Phones. Use a bottom sheet or a full screen there.
- Confirming something that cannot be undone. Use a dialog.

## Anatomy

- Container: `card`, 360 wide and never more than 400, 24 padding, full height.
- Header: title in `headline` and a close icon button.
- Body that scrolls on its own.
- Modal: rounded leading corners and a soft shadow over a scrim. Standard: a hairline divider and no shadow.

## Placement

Against the trailing edge. A standard sheet pushes the main content narrower; a modal sheet covers it.

## States

- Closed.
- Open.

## Motion

Slides in from the edge with the default spatial spring.

## Do and don't

- Do: Always show the close button.
- Do: Turn a phone's bottom sheet into a side sheet when the screen is wide enough.
- Don't: Scroll sideways inside it.
- Don't: Open one sheet over another.

## Accessibility

- Focus moves into a modal sheet and returns when it closes.
- Escape and the close button both close it.

## What you provide

The title, the content, and whether it is standard or modal.

## Source

Material 3 side sheet, standard and modal: 400 maximum width, 24 padding, close icon button recommended, modal preferred on small screens and standard on medium and expanded. Read 2026-11-21. Departure: 360 wide where Material's token is 256, so settings rows fit; leading corner radius was shown only as a graphic and 28 is used.
