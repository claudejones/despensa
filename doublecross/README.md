# Double Cross: Solo Mysteries — Public Test Build V10

This folder is ready for static hosting on GitHub Pages.

## What is included
- 12-case Murder Case Shelf
- Murder Case 01: The Last Signature (fully playable prototype)
- Cases 02–12 shown as Coming Soon
- Difficulty selection
- Three one-use Investigation Tactics
- Color-changing Investigation Time meter
- Case reset with confirmation
- Local browser saving via localStorage
- iPhone/iOS home-screen icon and web manifest
- Existing Double Cross card artwork used throughout

## GitHub Pages deployment
1. Create a new GitHub repository.
2. Upload the **contents of this folder** to the repository root.
3. Commit the files.
4. Open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select the `main` branch and `/ (root)`.
7. Save. GitHub will provide the public URL.

No backend is required.

## Add to iPhone Home Screen
Open the GitHub Pages URL in Safari:
1. Tap **Share**.
2. Tap **Add to Home Screen**.
3. The included `apple-touch-icon.png` will be used automatically.

The icon is linked in `index.html` with:
`<link rel="apple-touch-icon" sizes="180x180" href="assets/icons/apple-touch-icon.png">`

The PWA manifest is also linked:
`<link rel="manifest" href="manifest.webmanifest">`

## Saving and resetting
Progress is stored only in the user's browser using localStorage.
The **Reset This Case** button on the Case Home clears all Case 01 state and starts it fresh.

## Public-test note
Only Murder Case 01 is authored in this build. The other 11 cases are intentionally presented as **Coming Soon** rather than pretending unfinished cases are playable.

## V10 visual/UX changes
- Rebuilt hero art with no baked-in text.
- Brightened and reframed all 12 case thumbnails.
- Redesigned Murder Case cards to show their artwork more clearly.
- Added real inline tactic icons and compact active-tactic controls.
- Reset This Case only appears after actual case progress exists.
- Opening a case no longer counts as starting it.

## V11 changes
- Casual Detective automatically selects all 3 Tactics.
- Detective and Master Detective require intentional Tactic selection.
- Tactic selection uses the existing Double Cross card artwork.
- Investigation is grouped into Suspects, Locations, and Weapons.
- Bottom navigation uses a consistent custom SVG icon set.
- Final Theory form styling rebuilt for desktop and mobile.
- App icon redesigned as a high-contrast magnifying-glass DC mark.

## V12 structural UX redesign
- Removed the separate Investigate tab to eliminate duplication.
- Investigation now happens directly through Suspect, Weapon, and Location cards on the Case Board.
- Card drawers now contain full artwork, non-spoiler background, status, investigation actions, and discovered facts.
- Card artwork preserves its portrait composition instead of cropping faces and weapons.
- Added a sticky Investigation Time meter throughout the active case workspace.
- Added a dedicated Timeline screen built only from discovered time-based facts.
- Case File facts are grouped by evidence type.
- Bottom navigation is now Case Home, Case Board, Case File, Timeline, Final Theory.
- Final Theory was rebuilt with responsive styled controls.

## V13 polish pass
- Removed Investigation Time from the Case Home.
- Removed duplicate text labels under Case Board artwork.
- Reduced Case Board card size with a denser four-column desktop layout.
- Streamlined card drawer with sticky title/close header and smaller artwork.
- Improved Case File grouping and evidence summary.
- Improved Timeline with source labels and clearer fact-only explanation.
- Split Final Theory into required Core Solution and optional Bonus Deduction sections.

## V14 interaction/mobile polish
- Help and warning modals rebuilt with production styling.
- Section navigation scrolls back to the page top.
- Card drawer keeps identity, artwork, and Close visible while content scrolls.
- Six-card groups render as two rows of three on desktop and mobile.
- Timeline marker geometry corrected.

## V15 final interaction polish
- Replaced wide drawer hero crop with fixed full-card portrait thumbnail + identity header.
- Added labeled count pills for available investigations and discovered facts.
- Case Board sticky workspace now includes Investigation Time, selected Tactics, and category tabs.
- Case File, Timeline, and Final Theory keep Investigation Time + Tactics in the sticky workspace.
- Timeline uses a dedicated marker column so the dot cannot overlap the time.

## V16 polish
- Centered pill/status content vertically and horizontally.
- Added breathing room throughout card drawers.
- Standardized reset, coming-soon, clue reveal, and reconstruction dialogs.
- Replaced fragile scroll behavior with a forceTop helper.
- Starting/resuming the case and switching Suspect/Weapon/Location tabs now force the page to the top.

## V17 final Case Board density pass
- Reduced Case Board card height while retaining the existing 3 × 2 desktop layout.
- Tightened grid spacing slightly.
- Kept responsive sizing on smaller screens so embedded card names remain readable.
- No other V16 interface behavior or layout was intentionally changed.

## V18 complete-card board pass
- Desktop target is now the complete first row of three cards visible from the Case Board top position.
- Card artwork is proportionally scaled and no longer intentionally cropped.
- Desktop card grid is narrower and centered to create a more deliberate game-board presentation.
- Second row remains below the fold rather than over-shrinking all six cards.
- Tablet/mobile layouts prioritize embedded card-name legibility.

## V19 — Case 1 V2 gameplay rebuild
- Case 01 is now a completely new mystery: The Vanishing Ledger.
- New victim, killer, weapon, location, motive, timeline, clues, red herrings, and reconstruction.
- Evidence can unlock new suspect questions; unlocks are announced and marked NEW QUESTION on the Case Board.
- Multiple innocent and guilty suspects receive unlockable follow-ups so unlocks do not identify the murderer.
- Final Theory is now Who + What + Where only.
- Wrong theories reveal only 0/3, 1/3, or 2/3 correct, never which categories.
- Zero Investigation Time stops further paid investigation but never prevents solving.
- Correct solution flows directly into a full Case Solved reconstruction.

## V20 — playtest refinement
- Wrong Final Theory feedback is now a dismissible drawer rather than permanent page content.
- Incorrect-theory count remains visible near the Final Theory heading.
- Submitted Who / What / Where selections persist for revision.
- Removed the redundant "3 deductions" label from the Final Theory heading.
- Mobile Case Board cards now use readable UI-generated name/title labels rather than relying on tiny baked-in parchment text.
- Locked follow-up investigations are completely hidden until their prerequisite evidence is discovered.
- Existing NEW QUESTION notification/badge behavior remains, but undiscovered branches are no longer leaked in advance.
- Press the Witness, Second Look, Follow Another Lead, contradiction results, and related Tactic overlays now share the standardized modal/drawer treatment.
- Added safer standalone-iPhone top spacing.
