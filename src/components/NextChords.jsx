import { Chord } from 'tonal'
import { getEmotion, FUNCTION_COLORS } from '../theory/emotionMap'

// Map 0-indexed degree → function name key used in FUNCTION_COLORS

const DEGREE_TO_FUNCTION = {
  0: 'tonic',
  1: 'supertonic',
  2: 'mediant',
  3: 'subdominant',
  4: 'dominant',
  5: 'submediant',
  6: 'leading',
}

export function NextChords({ nextChords }) {
  if (!nextChords || nextChords.length === 0) {
    return (
      <div className="next-chords-panel">
        <div className="section-label">go next →</div>
        <p className="next-empty">Play a chord to see harmonic paths</p>
      </div>
    )
  }

  return (
    <div className="next-chords-panel">
      <div className="section-label">go next →</div>
      {nextChords.slice(0, 6).map((sug, i) => {
        const fnName = DEGREE_TO_FUNCTION[sug.degree]
        const fnColor = FUNCTION_COLORS[fnName] || '#94A3B8'

        // Get chord type for emotion
        let emotion = null
        if (sug.chord) {
          try {
            const info = Chord.get(sug.chord)
            emotion = getEmotion(info.type)
          } catch { /* ignore */ }
        }

        const barWidth = Math.round(sug.weight * 100)

        return (
          <div
            key={i}
            className="suggestion-card"
            style={{ opacity: 0.35 + sug.weight * 0.65 }}
          >
            <div className="sug-top-row">
              <span className="sug-numeral">{sug.numeral}</span>
              <span className="sug-chord" style={{ color: emotion?.color || fnColor }}>
                {sug.chord}
              </span>
              <div className="sug-bar-track">
                <div
                  className="sug-bar-fill"
                  style={{ width: `${barWidth}%`, background: emotion?.color || fnColor }}
                />
              </div>
            </div>
            {emotion && (
              <div className="sug-emotion">{emotion.label}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
