# Piano Mirror

Real-time harmonic visualizer for piano. Reads MIDI input, identifies chords,
infers key context, shows where you can go next, and colors everything by emotional feel.

---

## Requirements

- Windows 11
- Node.js 20+ — download from https://nodejs.org (choose "LTS")
- Google Chrome or Microsoft Edge (Firefox does NOT support Web MIDI API)
- A USB MIDI keyboard

---

## Setup (one time)

Open a terminal (Windows Terminal or PowerShell) and run:

```
cd path\to\piano-mirror
npm install
```

That installs React, Vite, Tonal.js, and Zustand. Takes about 30 seconds.

---

## Run

```
npm run dev
```

Open Chrome/Edge and go to: http://localhost:5173

When Chrome asks "Use MIDI devices?" — click Allow.

Plug in your keyboard (USB), and start playing. The app reacts instantly.

---

## Project structure

```
piano-mirror/
  src/
    midi/
      useMidi.js          ← Web MIDI API hook (note on/off → state)
    theory/
      chordDetect.js      ← MIDI notes → chord name (via Tonal.js)
      keyInfer.js         ← Recent notes → best-fit key + confidence
      harmonicGraph.js    ← Chord function + weighted next-chord table
      emotionMap.js       ← Chord type → color + feeling description
    components/
      HarmonicMap.jsx     ← Canvas circle-of-fifths orbit animation
      ChordLabel.jsx      ← Left panel: chord + emotion + key context
      NextChords.jsx      ← Right panel: next-chord suggestions
      PianoKeys.jsx       ← SVG keyboard strip (active notes highlighted)
      MidiStatus.jsx      ← Banner when no MIDI device found
    store/
      useStore.js         ← Zustand state (notes, chord, key, suggestions)
    styles/
      index.css           ← Dark theme + full layout
    App.jsx               ← Wires everything together
    main.jsx              ← React entry point
  index.html
  vite.config.js
  package.json
```

---

## Troubleshooting

**"No MIDI device found"**
- Make sure keyboard is plugged in before opening the page
- If you plugged in after loading, refresh the page (the app auto-detects on refresh)

**"MIDI access was denied"**
- In Chrome: click the lock icon in the address bar → Site settings → MIDI → Allow
- Then refresh

**"Web MIDI is not supported"**
- Switch to Google Chrome or Microsoft Edge. Firefox blocks Web MIDI.

**Chord shows as "?" or nothing**
- Hold at least 2 notes simultaneously
- Single notes won't trigger chord detection (by design)

---

## What the colors mean

| Color  | Meaning               |
|--------|-----------------------|
| Gold   | Tonic / major / home  |
| Red    | Dominant / tension    |
| Blue   | Subdominant / open    |
| Purple | Supertonic            |
| Teal   | Minor 7th / cool      |
| Pink   | Submediant            |
| Green  | Mediant               |
| Orange | Leading tone          |

---

## Roadmap

**Now (Prototype 1)**
- MIDI → chord detection → harmonic map → emotion colors ✓

**Next (Prototype 2)**
- Modulation detection (watch for key center shifts over time)
- Borrowed chord detection (e.g. IV from parallel minor)
- Progression recorder + export

**Later (V2)**
- Personal emotional calibration: the app plays intervals/chords and asks how
  you feel, building your own color map over time
- Secondary dominants highlighted (V/V, V/vi, etc.)
- Voice-leading tension meter

---

## Tech stack

- React 18 + Vite (fast dev, instant HMR)
- Tonal.js v6 (music theory engine — chord detection, key analysis, scale matching)
- Zustand (minimal reactive state)
- Canvas 2D (animated orbit map — 60fps, zero dependencies)
- Web MIDI API (native browser, no driver install needed)
