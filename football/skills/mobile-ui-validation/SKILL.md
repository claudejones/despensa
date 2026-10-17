# Mobile UI implementation and validation

Inputs: football/docs/APPROVED_MOBILE_UI_RELEASE_CONTRACT.md, approved mockups, live weekly JSON, current app, previous release state.

1. Implement reusable shell and design tokens. Every screen must match approved layouts and labels; never replace a detailed mockup with a simplified placeholder without clearly flagging it as incomplete.
2. Check small team logos and records on every team occurrence; preserve leg date/daypart; use Lucide icons, fixed five-tab bottom navigation, global calendar selector and safe areas.
3. Validate with automated browser interaction tests at 320, 375 and 430 CSS px: every tab and header action; week 6 load; research accordion independent expansion; office pool select/deselect/switch and copy; plan drilldown and draft import; local persistence, import/export and financial calculations.
4. Record screenshots and compare against approved design references. Inspect overflow, scrolling, contrast, touch targets and iPhone Safari compatibility.
5. Publish only after tests pass, then verify GitHub Pages deployment commit and live HTML/data. If tests or deployment verification fail, leave production unchanged and report gaps.

This file is a reusable workflow contract, not an automatically installed tool or proof of passing tests.
