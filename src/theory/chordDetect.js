import { Note, Chord } from 'tonal'

/**
 * Given an array of MIDI note numbers, return the best-fit chord name.
 * Uses chroma (pitch class 0-11) for enharmonic safety.
 *
 * @param {number[]} midiNotes
 * @returns {{ name: string, tonic: string, type: string, bass: string | null } | null}
 */
export function detectChord(midiNotes) {
  if (!midiNotes || midiNotes.length < 2) return null

  // Get unique pitch class names (enharmonic-safe via chroma)
  const seen = new Set()
  const pitchClasses = []

  for (const n of midiNotes) {
    const noteName = Note.fromMidi(n) // e.g. "C4", "A#4"
    const pc = Note.pitchClass(noteName) // e.g. "C", "A#"
    const chroma = Note.get(pc).chroma // 0-11

    if (!seen.has(chroma)) {
      seen.add(chroma)
      pitchClasses.push(pc)
    }
  }

  if (pitchClasses.length < 2) return null

  // Tonal.Chord.detect returns an array of possible chord symbols, best first
  const detected = Chord.detect(pitchClasses)
  if (!detected || detected.length === 0) return null

  const best = detected[0]
  const info = Chord.get(best)

  // Bass note = the lowest MIDI note played
  const lowestMidi = Math.min(...midiNotes)
  const bassName = Note.pitchClass(Note.fromMidi(lowestMidi))

  // Check for inversion: bass is not the root
  const isInversion = info.tonic && Note.get(bassName).chroma !== Note.get(info.tonic).chroma

  return {
    symbol: best,            // e.g. "CM", "Am7", "G7"
    name: info.name,         // e.g. "C major", "A minor seventh"
    tonic: info.tonic,       // e.g. "C"
    type: info.type,         // e.g. "major", "minor seventh"
    bass: isInversion ? bassName : null, // e.g. "E" if C/E inversion
    aliases: info.aliases,
    notes: info.notes,
  }
}
