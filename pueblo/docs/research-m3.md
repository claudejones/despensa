# Material 3 research notes (Pueblo)

Read live on 2026-11-21 from m3.material.io. Design system artifact: https://claude.ai/artifact/HJzmVnaVs5aQFM2pMs2jxL

## Pages read

| Page | Result |
|---|---|
| /styles/color/roles | Read. Full role list and pairings. |
| /styles/motion/overview/how-it-works | Read. Spatial vs effects springs, expressive vs standard scheme. |
| /styles/motion/overview/specs | Read. Web curve conversions (below). |
| /styles/shape/corner-radius-scale | Read. Ten-step scale. |
| /styles/shape/shape-morph | Read. Web: "not currently available". |
| /styles/typography/type-scale-tokens | Read, tables expanded. Sizes/line heights: display 57/64, 45/52, 36/44; headline 32/40, 28/36, 24/32; title 22/28, 16/24, 14/20; body 16/24, 14/20, 12/16; label 14/20, 12/16, 11/16. Emphasized weights 500 or 700. |
| /foundations/usability/applying-m-3-expressive | Read. Worked example (Aura app). |
| /develop/web | Read. Material Web in maintenance mode; M3 Expressive not implemented on web. |
| /blog/building-with-m3-expressive | Read. Announcement, 13 May 2025. |

Not yet read: every component page, layout (window size classes; the old URL 404s), elevation.

## Facts applied

- Web spring curves, expressive scheme: fast spatial `0.42, 1.67, 0.21, 0.90` 350 ms; default spatial `0.38, 1.21, 0.22, 1.00` 500 ms; slow spatial `0.39, 1.29, 0.35, 0.98` 650 ms; fast effects `0.31, 0.94, 0.34, 1.00` 150 ms; default effects `0.34, 0.80, 0.34, 1.00` 200 ms; slow effects `0.34, 0.88, 0.34, 1.00` 300 ms.
- Corner radius scale: 0, 4, 8, 12, 16, 20, 28, 32, 48 dp, full.
- Shape library: for mostly visual elements, sparingly, not on text-heavy containers.
- Type: 15 baseline + 15 emphasized styles; a brand typeface for large text and a plain one for small text is allowed.
- Expressive example: one hero moment per flow; extra-large primary button low on the screen.

## Applied from memory (verify)

- None. Type sizes now use the captured M3 steps.

## Own work, not Material's

- The seven morphable shapes are Pueblo's own polar shapes, morphed with a clip-path polygon transition. Google does not publish its shape library for web.

## Other verified platform facts (2026-11-21)

- CSS `shape()`: iOS Safari 18.4+, Chrome Android 135+, Baseline since Feb 2026 (MDN, modified 2026-10-07). Morphing with it is untested here.
- SpeechRecognition: iOS Safari 14.5+ prefixed, not Baseline, server-based by default (MDN, modified 2026-11-16). Untested on device.
- ts-fsrs: MIT, release 2026-11-10. Browser use unconfirmed.
- Fonts on Google Fonts with a Latin subset: Nunito, Lilita One, Pixelify Sans (checked via the CSS API).
- Icons: lucide-static 0.460.0, ISC licence, embedded as SVG.

## Decisions so far

- New design system, own theme; nothing borrowed from the old training tool's look.
- Town modelled on the Yucatán peninsula (chosen by Claude when told "do what makes sense"; owner can overrule).
- Five-colour code: cobalto act, nopal correct, cochinilla wrong, ocre money, rosa celebrate. Wall colours in art only.
- Townspeople in pixel art with expression sprites; avatar later as pick-and-recolour.
- English subtitles on dialogue: shown with the Spanish, on by default, can be switched off.
- Picture rule: pictures beside English only; Spanish answers are text only.
- Working title "Pueblo" is a placeholder.

## Component pages (read live 2026-11-21)

Specs, guidelines and accessibility tabs read for: sliders, bottom sheets, dialogs, navigation bar, app bars, buttons, button groups, icon buttons, chips, switch, progress indicators, loading indicator, snackbar, text fields, tooltips, cards, lists, badges. All loaded.

Not readable on those pages (shown as graphics): most corner radii in token tables, type-style names, measurement diagrams. Where a radius was not readable, Pueblo's own scale value is used and the component's Source note says so.

Key numbers applied: button M 56 high / S 40 high with pressed corners 12 / 8; connected button group 2 gap, 8 inner corners, 4 pressed; icon button 40 and 56 with 24 icon; flexible navigation bar 64 high with 56x32 indicator; small app bar 64; switch 52x32 with 16/24/28 handle; slider XS 16 track, 4x44 handle, 6 gap; bottom sheet 32x4 handle, 640 max; dialog 28 corners, 280-560 wide, 24 padding; snackbar 48; text field 56; list item 72 two-line; loading indicator 38 in 48; rich tooltip padding 12/8/16.

Each component's README ends with a Source section naming the Material component it follows and every deliberate departure.

## How the design system is built

- `design/system/project/` is what is published to the artifact.
- `design/system/tools/specs/*.mjs` hold every component's preview and guidelines; `node tools/gen-components.mjs` writes them.
- `design/system/src/behaviours.js` plus the Lucide icons become `bundle.js` via `node tools/build-bundle.mjs <lucide-static/icons>`.
- Render check and interaction tests were run with Playwright from the session scratchpad; they are not yet saved in the repository.
