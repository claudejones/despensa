// Where each Material-derived component comes from, and where Pueblo departs from it.
// Material 3 component pages (specs, guidelines, accessibility) read live on 2026-11-21 at m3.material.io.
const R = 'Read 2026-11-21.';
export const SRC = {
  TopBar: `Material 3 app bar, small: 64 high, 4 side padding, 24 icons, one action. ${R} Departure: the title uses the rótulo face at 24/32 where Material uses title-large.`,
  BottomBar: `Material 3 flexible navigation bar: 64 high, 24 icons, 56 by 32 indicator, three to five labelled destinations. ${R} Departures: Material marks the active item with a filled icon, Lucide has no filled set so the stroke is heavier; the badge is ink where Material uses its error colour, because red is reserved for wrong answers.`,
  Button: `Material 3 button, sizes M (56 high, 24 padding, 24 icon) and S (40 high, 16 padding, 48 target); pressed corners 12 and 8. ${R} Departures: the primary label is 22/28 (Material's label style for size M was not readable on the page); the disabled button uses solid neutral tones instead of 10% and 38% opacity, for contrast.`,
  ButtonGroup: `Material 3 connected button group, size S: 40 high, 2 gap, 8 inner corners, 4 when pressed, selected fully rounded, 48 target. ${R}`,
  IconButton: `Material 3 icon button, sizes S (40, 24 icon) and M (56, 24 icon), 48 target, pressed corners 8 and 12. ${R}`,
  StatusPill: `Pueblo original, sized like a Material 3 chip (32 high, 18 icon). It is not a Material chip: Material chips come in sets and are pressable, and this is a single static fact.`,
  Switch: `Material 3 switch: 52 by 32 track with a 2 outline, handle 16 off, 24 on, 28 pressed, 48 target. ${R}`,
  ProgressBar: `Pueblo original. Material's progress indicator is for waiting, so this is not one; it borrows the rounded track only.`,
  QuantitySlider: `Material 3 slider, size XS with stops: 16 track with 8 corners, 4 wide by 44 high handle narrowing to 2 when pressed, 6 gap beside the handle. ${R} Departure: the value is shown as a Spanish phrase above the track instead of in Material's value bubble.`,
  Card: `Material 3 card: 16 padding, one topic per card. ${R} Departure: corners are 28 where Material uses 12, to match the scene window; Material cautions against large corners on dense cards, so dense content keeps 16 padding clear of them.`,
  BottomSheet: `Material 3 bottom sheet: 32 by 4 drag handle with 22 above and below, 640 maximum width, modal sheets open to half height. ${R} Top corner radius was shown only as a graphic; 28 is used.`,
  SideSheet: `Material 3 side sheet, standard and modal: 400 maximum width, 24 padding, close icon button recommended, modal preferred on small screens and standard on medium and expanded. ${R} Departure: 360 wide where Material's token is 256, so settings rows fit; leading corner radius was shown only as a graphic and 28 is used.`,
  Dialog: `Material 3 basic dialog: 28 corners, 280 to 560 wide, 24 padding, 16 between icon, title and text, 24 above the actions, two actions at most. ${R} Departure: supporting text is 16/24 where Material uses 14/20.`,
  Snackbar: `Material 3 snackbar: 48 high for one line, one text action, no icon, never over navigation. ${R} Corner radius and padding were shown only as graphics.`,
  TypingField: `Material 3 outlined text field: 56 high, 16 side padding, label always visible. ${R} Departures: the label sits above the field as the English prompt instead of floating inside it; input text is 22/28 where Material uses 16/24, because it is the Spanish being learned.`,
  InfoTip: `Material 3 rich tooltip: 12 top, 8 bottom and 16 side padding, never for critical information. ${R} Departure: it opens on tap and stays until dismissed, where Material opens on hover or long-press.`,
  SettingsRow: `Material 3 list item, two-line: 72 high, 16 side padding, 12 between elements. ${R}`,
  LoadingIndicator: `Material 3 loading indicator: 38 shape in a 48 box, for waits of 200 ms to 5 s, loops through shape morphs. ${R} Departure: it morphs through Pueblo's own six shapes; Material's seven are not published for web.`,
  EmptyState: `Pueblo original. Uses Material 3 type and colour roles.`,
  ResultsSummary: `Pueblo original. Built from the card, mastery token and button.`,
};
