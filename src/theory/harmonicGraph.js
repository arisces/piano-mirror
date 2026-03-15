import { Note, Key, Chord } from 'tonal'

// ─── Roman numeral labels for 7 diatonic degrees ───────────────────────────
const MAJOR_NUMERALS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
const MAJOR_FUNC_LABELS = ['Tonic', 'Supertonic', 'Mediant', 'Subdominant', 'Dominant', 'Submediant', 'Leading Tone']
const MAJOR_FUNC_NAMES = ['tonic', 'supertonic', 'mediant', 'subdominant', 'dominant', 'submediant', 'leading']

// ─── Transition weights: degree index → [{to: degree index, w: 0-1}] ───────
// Based on common-practice voice-leading probability.
// Weights reflect "how often does this move feel natural / expected."
const MAJOR_TRANSITIONS = {
  0: [{ to: 3, w: 0.9 }, { to: 4, w: 0.9 }, { to: 5, w: 0.8 }, { to: 1, w: 0.7 }, { to: 2, w: 0.5 }, { to: 6, w: 0.4 }], // I
  1: [{ to: 4, w: 0.9 }, { to: 3, w: 0.7 }, { to: 6, w: 0.6 }, { to: 0, w: 0.4 }],                                          // ii
  2: [{ to: 5, w: 0.8 }, { to: 3, w: 0.7 }, { to: 1, w: 0.6 }, { to: 0, w: 0.5 }],                                          // iii
  3: [{ to: 0, w: 0.8 }, { to: 4, w: 0.8 }, { to: 1, w: 0.7 }, { to: 5, w: 0.6 }],                                          // IV
  4: [{ to: 0, w: 0.95 }, { to: 5, w: 0.7 }, { to: 3, w: 0.5 }, { to: 1, w: 0.4 }],                                         // V
  5: [{ to: 3, w: 0.8 }, { to: 1, w: 0.7 }, { to: 4, w: 0.7 }, { to: 0, w: 0.5 }, { to: 2, w: 0.4 }],                      // vi
  6: [{ to: 0, w: 0.9 }, { to: 4, w: 0.5 }],                                                                                  // vii°
}

/**
 * Find which diatonic degree (0-indexed) the chord root falls on in the given key.
 * Uses chroma comparison to avoid enharmonic mismatches.
 */
function getDegree(chordTonic, keyScale) {
  const chordChroma = Note.get(chordTonic).chroma
  return keyScale.findIndex((n) => Note.get(n).chroma === chordChroma)
}

/**
 * Return the harmonic function of a chord within a key.
 * @param {string} chordTonic  - e.g. "G"
 * @param {string} keyTonic    - e.g. "C"
 * @param {string} keyMode     - "major" | "minor"
 * @returns {{ numeral, label, function, degree } | null}
 */
export function getHarmonicFunction(chordTonic, keyTonic, keyMode) {
  if (!chordTonic || !keyTonic) return null

  try {
    const key = Key.majorKey(keyTonic)
    const degree = getDegree(chordTonic, key.scale)

    if (degree === -1) {
      return { numeral: '?', label: 'Non-diatonic', function: 'chromatic', degree: -1 }
    }

    return {
      numeral: MAJOR_NUMERALS[degree],
      label: MAJOR_FUNC_LABELS[degree],
      function: MAJOR_FUNC_NAMES[degree],
      degree: degree + 1, // 1-indexed for display
    }
  } catch {
    return null
  }
}

/**
 * Given a current chord and key, return weighted next-chord suggestions.
 * @returns {Array<{ chord: string, numeral: string, weight: number, degree: number }>}
 */
export function getNextChords(chordTonic, keyTonic, keyMode) {
  if (!chordTonic || !keyTonic) return []

  try {
    const key = Key.majorKey(keyTonic)
    const degree = getDegree(chordTonic, key.scale)

    if (degree === -1) return [] // Non-diatonic — skip for now

    const transitions = MAJOR_TRANSITIONS[degree] || []
    const triads = key.triads // e.g. ["CM", "Dm", "Em", "FM", "GM", "Am", "Bdim"]

    return transitions
      .map((t) => ({
        chord: triads[t.to],
        numeral: MAJOR_NUMERALS[t.to],
        weight: t.w,
        degree: t.to,
      }))
      .filter((t) => !!t.chord)
  } catch {
    return []
  }
}
