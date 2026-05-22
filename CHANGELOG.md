# Changelog

## 0.1.5

- Rebranded the app as Southpaw Scales.
- Added Cloudflare Pages deployment config, npm deploy script, and GitHub Actions workflow.
- Documented the public static-hosting path for `guitar.denley.nz`.

## 0.1.4

- Added a key-aware 12-bar blues practice loop with Play, Pause, Stop, and current-bar highlighting.
- Added soft Web Audio chord playback for I7, IV7, and V7 blues changes.
- Displayed dominant seventh chord tones with friendlier flat seventh spelling in the practice loop.

## 0.1.3

- Replaced numeric interval labels with full interval names.
- Matched circle-of-fifths key colours to the current parent key's modal colours.

## 0.1.2

- Added colour-coded root, third, fifth, and seventh chord-tone badges.
- Added an interval table for the selected key and mode.
- Added a clickable circle of fifths key wheel.

## 0.1.1

- Added persisted handedness preference using browser local storage.
- Added available triad and seventh chord badges to the mode relationship map.
- Reworked large-screen harmony layout so relationship and borrowed-chord panels sit side by side.

## 0.1.0

- Initial React/Vite guitar scale generator.
- Added selectable keys, modes, left-handed/right-handed rendering, and relative mode rows.
- Added tests for scale, parent-key, fretboard, and handedness logic.
- Added container and Kubernetes deployment artifacts for `guitar.denley.nz`.
