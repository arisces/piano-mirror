import { Note, Scale } from 'tonal'

// Use standard enharmonic spellings that Tonal handles correctly
const ALL_TONICS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F']

// Cache scale chroma sets to avoid re-computing every call
const scaleCache = new Map()

function getScaleChroma(tonic, mode) {
  const key = `${tonic}${mode}`
  if (!scaleCache.has(key)) {
    const scale = Scale.get(`${tonic} ${mode}`)
    if (scale.empty) {
      scaleCache.set(key, null)
    } else {
      const chromas = new Set(scale.notes.map((n) => Note.get(n).chroma))
      scaleCache.set(key, chromas)
    }
  }
  return scaleCache.get(key)
}

/**
 * Given an array of recent MIDI note numbers, infer the most likely tonal center.
 * Returns the best key with a confidence score.
 *
 * @param {number[]} recentMidiNotes
 * @returns {{ tonic: string, mode: string, confidence: number }}
 */
export function inferKey(recentMidiNotes) {
  if (!recentMidiNotes || recentMidiNotes.length === 0) {
    return { tonic: 'C', mode: 'major', confidence: 0 }
  }

  // Unique pitch classes from MIDI (chroma 0-11)
  const playedChromas = new Set(recentMidiNotes.map((n) => n % 12))

  let best = { tonic: 'C', mode: 'major', confidence: 0 }

  for (const tonic of ALL_TONICS) {
    for (const mode of ['major', 'minor']) {
      const scaleChroma = getScaleChroma(tonic, mode)
      if (!scaleChroma) continue

      let matches = 0
      playedChromas.forEach((pc) => {
        if (scaleChroma.has(pc)) matches++
      })

      const confidence = matches / playedChromas.size

      if (confidence > best.confidence) {
        best = { tonic, mode, confidence }
      }
    }
  }

  return best
}
