# Piano Chords

A landscape piano chord trainer built with plain HTML, CSS and JavaScript — no dependencies, no build step. Installable as a PWA and usable offline.

## Features

- **Two practice types**
  - *Chord name → piano*: shows the scale, chord (e.g. `G7 / Sol7`) and required inversion.
  - *Treble/bass clef notation → piano*: shows the chord on a staff with the scale's key signature.
- **Diatonic chords only**: a chord is asked only if all its notes belong to one of the selected scales.
- **36 scales**: 12 major, 12 natural minor and 12 harmonic minor, with correct enharmonic spelling (letter + solfège names).
- **12 chord types**: maj, m, dim, aug, sus2, sus4, 7, maj7, m7, m7♭5, dim7, m(maj7) — all inversions.
- **Keyboard F1–G6**: 8 white keys beyond each staff, with a dashed marker at middle C.
- **Instant feedback**: correct keys turn green, wrong keys red; tap a key again to unselect it.
- **Answer reveal**: on success, sparkles play and the top half splits to show the answer (staff + note names, or chord name + inversion). Tap anywhere to continue.

### Answer checking

- **Staff mode** — exactly the keys shown on the staff must be pressed.
- **Name mode** — any octave is accepted, as long as each chord tone is pressed exactly once and the lowest key is the bass note of the requested inversion.

## Configuration

Open **Configure** from the main menu to choose scales, chord types and practice types (each group has an *All* toggle). Changes are saved to `localStorage` immediately. **Reset** clears the saved settings and selects everything.

## Controls

| Action | Input |
| --- | --- |
| Toggle a key | Tap / click the key |
| Next challenge (after solving) | Tap / click anywhere |
| Skip the current challenge | **Skip** button (top right) |
| Back to main menu | **Back** button or `Esc` |

## Running

Open `index.html` directly in a browser — it works from `file://`.

To install it as a PWA and use it offline, serve it over HTTP(S):

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Installation on a phone requires HTTPS (e.g. GitHub Pages, Netlify, Cloudflare Pages). When installed, the app is locked to landscape; in a regular browser tab a "rotate your device" overlay is shown in portrait.

## Project structure

```
index.html            Screens: main menu, configure, practice
style.css             Dark beige theme, layout, keyboard, staff, sparkles
manifest.webmanifest  PWA manifest (fullscreen, landscape)
sw.js                 Service worker (cache-first offline support)
icons/                App icons
js/theory.js          Scales, key signatures, chord types, spelling, voicing
js/config.js          Config groups and localStorage load/save/reset
js/configure.js       Configure screen
js/staff.js           SVG staff rendering (clefs, key signatures, ledger lines)
js/keyboard.js        Piano keyboard rendering
js/practice.js        Challenge generation, answer checking, feedback
js/app.js             Screen navigation and startup
js/a11y.js            Screen reader text, symbol pronunciation, live announcements
```

Scripts are plain (non-module) scripts loaded in order with `defer`, sharing globals.

## Updating the installed app

The service worker caches all files. After changing any file, bump the cache name in `sw.js` (`piano-chords-v1` → `piano-chords-v2`) so installed copies pick up the new version.
