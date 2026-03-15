import { Note } from 'tonal'

// Which semitones within an octave are white keys
const WHITE_SEMITONES = [0, 2, 4, 5, 7, 9, 11]
// Black key semitone → fractional offset within the octave's white key span
// e.g. C# (1) appears 0.6 of the way after C (at index 0)
const BLACK_KEY_OFFSETS = {
  1:  0.6,   // C#/Db
  3:  1.6,   // D#/Eb
  6:  3.6,   // F#/Gb
  8:  4.6,   // G#/Ab
  10: 5.6,   // A#/Bb
}

const START_OCTAVE = 2  // C2 = MIDI 36
const END_OCTAVE = 6    // B6 = MIDI 95

const WHITE_KEY_W = 22
const WHITE_KEY_H = 72
const BLACK_KEY_W = 14
const BLACK_KEY_H = 45

export function PianoKeys({ activeNotes, emotionColor }) {
  // Build all key data
  const whiteKeys = []
  const blackKeys = []

  for (let oct = START_OCTAVE; oct <= END_OCTAVE; oct++) {
    const octaveWhiteOffset = (oct - START_OCTAVE) * 7

    WHITE_SEMITONES.forEach((semitone, i) => {
      const midi = oct * 12 + semitone
      const x = (octaveWhiteOffset + i) * WHITE_KEY_W
      whiteKeys.push({ midi, x, active: activeNotes.includes(midi) })
    })

    Object.entries(BLACK_KEY_OFFSETS).forEach(([semitone, offset]) => {
      const midi = oct * 12 + parseInt(semitone)
      const x = (octaveWhiteOffset + offset) * WHITE_KEY_W - BLACK_KEY_W / 2
      blackKeys.push({ midi, x, active: activeNotes.includes(midi) })
    })
  }

  const totalWhite = (END_OCTAVE - START_OCTAVE + 1) * 7
  const svgWidth = totalWhite * WHITE_KEY_W
  const activeColor = emotionColor || '#F4C430'

  return (
    <div className="piano-container">
      <svg
        width={svgWidth}
        height={WHITE_KEY_H + 4}
        viewBox={`0 0 ${svgWidth} ${WHITE_KEY_H + 4}`}
        style={{ display: 'block' }}
      >
        {/* White keys (rendered first so black keys overlay correctly) */}
        {whiteKeys.map((k) => (
          <rect
            key={k.midi}
            x={k.x + 0.5}
            y={2}
            width={WHITE_KEY_W - 1}
            height={WHITE_KEY_H}
            rx={3}
            fill={k.active ? activeColor : '#EEE9E0'}
            stroke="#555460"
            strokeWidth={0.5}
          />
        ))}

        {/* Black keys (rendered on top) */}
        {blackKeys.map((k) => (
          <rect
            key={k.midi}
            x={k.x}
            y={2}
            width={BLACK_KEY_W}
            height={BLACK_KEY_H}
            rx={2}
            fill={k.active ? '#E25C3B' : '#1a1a2e'}
            stroke="#0d0d1a"
            strokeWidth={0.5}
          />
        ))}
      </svg>
    </div>
  )
}
