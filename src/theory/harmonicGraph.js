import { Note, Key } from 'tonal'

// ─── Major diatonic labels ─────────────────────────────────────────────────
const MAJOR_NUMERALS    = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
const MAJOR_FUNC_LABELS = ['Tonic', 'Supertonic', 'Mediant', 'Subdominant', 'Dominant', 'Submediant', 'Leading Tone']
const MAJOR_FUNC_NAMES  = ['tonic', 'supertonic', 'mediant', 'subdominant', 'dominant', 'submediant', 'leading']

// ─── Natural minor diatonic labels ────────────────────────────────────────
const MINOR_NUMERALS    = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']
const MINOR_FUNC_LABELS = ['Tonic', 'Half-dim', 'Mediant', 'Subdominant', 'Dominant', 'Submediant', 'Subtonic']
const MINOR_FUNC_NAMES  = ['tonic', 'supertonic', 'mediant', 'subdominant', 'dominant', 'submediant', 'leading']

// ─── Transition weight tables ──────────────────────────────────────────────
// Each entry: { to: 0-indexed degree, w: 0–1 probability weight }
const MAJOR_TRANSITIONS = {
  0: [{ to: 3, w: 0.9 }, { to: 4, w: 0.9 }, { to: 5, w: 0.8 }, { to: 1, w: 0.7 }, { to: 2, w: 0.5 }, { to: 6, w: 0.4 }],
  1: [{ to: 4, w: 0.9 }, { to: 3, w: 0.7 }, { to: 6, w: 0.6 }, { to: 0, w: 0.4 }],
  2: [{ to: 5, w: 0.8 }, { to: 3, w: 0.7 }, { to: 1, w: 0.6 }, { to: 0, w: 0.5 }],
  3: [{ to: 0, w: 0.8 }, { to: 4, w: 0.8 }, { to: 1, w: 0.7 }, { to: 5, w: 0.6 }],
  4: [{ to: 0, w: 0.95 }, { to: 5, w: 0.7 }, { to: 3, w: 0.5 }, { to: 1, w: 0.4 }],
  5: [{ to: 3, w: 0.8 }, { to: 1, w: 0.7 }, { to: 4, w: 0.7 }, { to: 0, w: 0.5 }, { to: 2, w: 0.4 }],
  6: [{ to: 0, w: 0.9 }, { to: 4, w: 0.5 }],
}

// Natural minor voice-leading — mirrors common jazz/classical minor practice
const MINOR_TRANSITIONS = {
  0: [{ to: 3, w: 0.85 }, { to: 5, w: 0.8 }, { to: 6, w: 0.75 }, { to: 4, w: 0.7 }, { to: 1, w: 0.5 }],  // i
  1: [{ to: 4, w: 0.85 }, { to: 3, w: 0.65 }, { to: 0, w: 0.4 }],                                           // ii°
  2: [{ to: 5, w: 0.75 }, { to: 6, w: 0.65 }, { to: 3, w: 0.6 }],                                           // III
  3: [{ to: 0, w: 0.8 }, { to: 4, w: 0.8 }, { to: 1, w: 0.65 }, { to: 5, w: 0.55 }],                       // iv
  4: [{ to: 0, w: 0.9 }, { to: 5, w: 0.6 }, { to: 3, w: 0.45 }],                                            // v
  5: [{ to: 2, w: 0.75 }, { to: 3, w: 0.7 }, { to: 4, w: 0.65 }, { to: 0, w: 0.5 }],                       // VI
  6: [{ to: 0, w: 0.85 }, { to: 3, w: 0.6 }, { to: 4, w: 0.5 }],                                            // VII
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function getDegree(chordTonic, keyScale) {
  const chordChroma = Note.get(chordTonic).chroma
  return keyScale.findIndex((n) => Note.get(n).chroma === chordChroma)
}

function resolveKey(keyTonic, keyMode) {
  if (keyMode === 'minor') {
    const k = Key.minorKey(keyTonic)
    return {
      scale:    k.natural.scale,
      triads:   k.natural.triads,
      numerals: MINOR_NUMERALS,
      funcLabels: MINOR_FUNC_LABELS,
      funcNames:  MINOR_FUNC_NAMES,
      transitions: MINOR_TRANSITIONS,
    }
  }
  const k = Key.majorKey(keyTonic)
  return {
    scale:    k.scale,
    triads:   k.triads,
    numerals: MAJOR_NUMERALS,
    funcLabels: MAJOR_FUNC_LABELS,
    funcNames:  MAJOR_FUNC_NAMES,
    transitions: MAJOR_TRANSITIONS,
  }
}

// ─── Public API ────────────────────────────────────────────────────────────

export function getHarmonicFunction(chordTonic, keyTonic, keyMode) {
  if (!chordTonic || !keyTonic) return null

  try {
    const { scale, numerals, funcLabels, funcNames } = resolveKey(keyTonic, keyMode)
    const degree = getDegree(chordTonic, scale)

    if (degree === -1) {
      return { numeral: '?', label: 'Non-diatonic', function: 'chromatic', degree: -1 }
    }

    return {
      numeral:  numerals[degree],
      label:    funcLabels[degree],
      function: funcNames[degree],
      degree:   degree + 1, // 1-indexed for display
    }
  } catch {
    return null
  }
}

export function getNextChords(chordTonic, keyTonic, keyMode) {
  if (!chordTonic || !keyTonic) return []

  try {
    const { scale, triads, numerals, transitions } = resolveKey(keyTonic, keyMode)
    const degree = getDegree(chordTonic, scale)

    if (degree === -1) return []

    return (transitions[degree] || [])
      .map((t) => ({
        chord:   triads[t.to],
        numeral: numerals[t.to],
        weight:  t.w,
        degree:  t.to,
      }))
      .filter((t) => !!t.chord)
  } catch {
    return []
  }
}
