# Double Cross: The Ravensworth Conspiracy — Campaign V1

A mobile-first, standalone GitHub Pages build containing all 12 playable Ravensworth murder cases.

## Locked system rules
- Case-authored Investigation Time.
- Exactly **3 Final Theory attempts** per case.
- Final Theory uses visual Suspect / Weapon / Location selections.
- Cases unlock sequentially.
- Every solved case unlocks one Campaign Discovery.
- All 12 discoveries reveal the larger Ravensworth Double Cross.
- Core loop: Observe → Hypothesize → Investigate → Deduce → Revise → Solve.
- Tactics remain scarce and are chosen by difficulty.
- Free card background is case-specific; paid investigations uncover evidence.
- Conditional questions stay hidden until their prerequisite evidence is discovered.

## Hosting
Upload the contents of this folder to the root of a GitHub Pages repository. `index.html` is the entry point.


## V2 UX / bug-fix pass
- Campaign messaging clarified.
- Case Brief hierarchy improved.
- Possibilities shown as a total count.
- Tactics explanation added.
- Suspect / Weapon / Location investigation drawers restored.
- Desktop and mobile card treatments unified.
- Tactic warning drawers compacted.
- Detective Notes converted to individual saved notes.
- Timeline timestamps repaired and newest event dot pulses.
- Final Theory simplified to a single confirmation step.
- Theory attempts moved into the Final Theory decision area.

## V3 verified repair
- Restored compact Suspect / Weapon / Location drawers.
- Restored neutral Background copy plus case-specific What You Know copy.
- Fixed card image cropping so portrait tops remain visible while baked parchment is hidden.
- Forced card name and role/title onto separate lines at every breakpoint.
- Removed the duplicate eliminated pill; one elimination stamp remains.
- Restored body-discovery times for all 12 timelines.
- Added pulse animation to the newest visible timeline event.
- Rechecked all 12 cases for structural solution, clue-path, tactic-reference, timeline-reference, budget, and campaign consistency.

## V4 visual refinement
- Reduced board-card artwork window so baked parchment/name plates are fully hidden.
- Preserved portrait tops while cropping from the bottom.
- Corrected Final Theory preview cards so category, name, and role sit in dedicated label panels below the image.
- Removed text bleed into Final Theory artwork on desktop and mobile.

## V6 authoritative visual repair
- Removed the malformed V5 CSS append.
- Added a unique objectiveTask class and removed the yellow rule from the objective block.
- Kept the yellow rule only on How This Case Works.
- Rebuilt the drawer thumbnail crop using a dedicated overflow-hidden thumbnail window.
- Rebuilt Final Theory preview markup so category, image, name, and role are separate DOM elements.
- Added one authoritative CSS block to override legacy conflicting card rules.
- Added explicit V6 validation checks for the objective, drawer crop, theory cards, and malformed CSS remnants.

## V7 unified card system
- Drawer thumbnails now use the same artwork-only crop logic as the Case Board.
- Final Theory selections now render as compact portrait cards rather than landscape previews.
- Baked parchment/name plates are hidden in drawer and theory contexts.
- App-rendered names/titles are the only identity text in these UI components.
