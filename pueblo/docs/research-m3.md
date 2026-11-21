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
| /styles/typography/type-scale-tokens | Partly read. Guidance yes; per-style sizes sit in collapsed tables, NOT captured. |
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

- Interface type sizes 24/32, 18/24, 16/24, 14/20 are chosen near the M3 scale; the exact M3 token values were not captured.

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
