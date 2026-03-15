import { useEffect } from 'react'

import { useMidi } from './midi/useMidi'
import { useStore } from './store/useStore'
import { detectChord } from './theory/chordDetect'
import { inferKey } from './theory/keyInfer'
import { getHarmonicFunction, getNextChords } from './theory/harmonicGraph'
import { getEmotion } from './theory/emotionMap'

import { HarmonicMap } from './components/HarmonicMap'
import { ChordLabel } from './components/ChordLabel'
import { NextChords } from './components/NextChords'
import { PianoKeys } from './components/PianoKeys'
import { MidiStatus } from './components/MidiStatus'

// Keep a rolling buffer of recent MIDI notes for key inference
// (last N note events, including released ones for context)
const NOTE_HISTORY_MAX = 40
let noteHistory = []

export default function App() {
  const {
    activeNotes,
    midiStatus,
    currentChord,
    inferredKey,
    harmonicFunction,
    nextChords,
    progressionHistory,   // ← reactive subscription, not getState() snapshot
  } = useStore()

  const setTheoryState = useStore((s) => s.setTheoryState)

  // Connect MIDI
  useMidi()

  // Derive all theory state whenever active notes change
  useEffect(() => {
    // Add new active notes to rolling history
    activeNotes.forEach((n) => {
      if (!noteHistory.includes(n)) {
        noteHistory = [...noteHistory, n].slice(-NOTE_HISTORY_MAX)
      }
    })

    // Detect chord from currently held notes
    const chord = detectChord(activeNotes)

    if (!chord) {
      setTheoryState(null, inferredKey, null, [])
      return
    }

    // Infer key from history (more context = better inference)
    const key = noteHistory.length >= 3
      ? inferKey(noteHistory)
      : inferKey(activeNotes)

    // Harmonic function (what role does this chord play?)
    const fn = chord.tonic && key
      ? getHarmonicFunction(chord.tonic, key.tonic, key.mode)
      : null

    // Next chord suggestions
    const suggestions = chord.tonic && key
      ? getNextChords(chord.tonic, key.tonic, key.mode)
      : []

    setTheoryState(chord, key, fn, suggestions)
  }, [activeNotes])

  // Get emotion from current chord type
  const emotion = currentChord ? getEmotion(currentChord.type) : null

  // Display key name for header
  const keyDisplay = inferredKey
    ? `${inferredKey.tonic} ${inferredKey.mode}`
    : null

  const fnDisplay = harmonicFunction && harmonicFunction.numeral !== '?'
    ? `${harmonicFunction.numeral} · ${harmonicFunction.label}`
    : null

  return (
    <div className="app">
      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="app-logo">Piano Mirror</div>
        <div className="header-center">
          {keyDisplay && (
            <span className="key-badge" style={{ color: emotion?.color || '#F4C430' }}>
              {keyDisplay}
              {fnDisplay && <span className="fn-badge"> · {fnDisplay}</span>}
            </span>
          )}
        </div>
        <div className={`midi-indicator ${midiStatus === 'ready' ? 'connected' : 'disconnected'}`}>
          <span className="midi-dot" />
          {midiStatus === 'ready' ? 'MIDI connected' : 'No MIDI device'}
        </div>
      </header>

      {/* ── MIDI status warning ───────────────────────────────────── */}
      <MidiStatus status={midiStatus} />

      {/* ── Main three-panel layout ───────────────────────────────── */}
      <main className="app-main">
        {/* Left: chord info + emotion */}
        <aside className="panel-left">
          <ChordLabel
            chord={currentChord}
            emotion={emotion}
            harmonicFunction={harmonicFunction}
            inferredKey={inferredKey}
          />
        </aside>

        {/* Center: harmonic orbit map */}
        <section className="panel-center">
          <HarmonicMap
            currentChord={currentChord}
            nextChords={nextChords}
            inferredKey={inferredKey}
            emotionColor={emotion?.color}
          />
        </section>

        {/* Right: next chord suggestions */}
        <aside className="panel-right">
          <NextChords nextChords={nextChords} />
        </aside>
      </main>

      {/* ── Piano keyboard strip ──────────────────────────────────── */}
      <footer className="app-footer">
        <PianoKeys
          activeNotes={activeNotes}
          emotionColor={emotion?.color}
        />
        {progressionHistory.length > 0 && (
          <div className="footer-history">
            Progression: {progressionHistory.slice(-8).join(' → ')}
          </div>
        )}
      </footer>
    </div>
  )
}
