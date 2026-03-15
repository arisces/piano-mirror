import { FUNCTION_COLORS } from '../theory/emotionMap'

export function ChordLabel({ chord, emotion, harmonicFunction, inferredKey }) {
  if (!chord) {
    return (
      <div className="chord-label-panel empty">
        <div className="chord-label-hint">
          <p>Connect your keyboard</p>
          <p>and start playing</p>
        </div>
      </div>
    )
  }

  const fnColor = harmonicFunction
    ? (FUNCTION_COLORS[harmonicFunction.function] || '#94A3B8')
    : '#94A3B8'

  return (
    <div className="chord-label-panel">
      {/* Main chord display */}
      <div className="chord-symbol" style={{ color: emotion?.color || '#F4C430' }}>
        {chord.symbol}
        {chord.bass && (
          <span className="chord-inversion">/{chord.bass}</span>
        )}
      </div>
      <div className="chord-full-name">{chord.name}</div>

      {/* Harmonic function badge */}
      {harmonicFunction && harmonicFunction.numeral !== '?' && (
        <div
          className="function-pill"
          style={{
            color: fnColor,
            background: fnColor + '18',
            border: `0.5px solid ${fnColor}40`,
          }}
        >
          <span className="fn-numeral">{harmonicFunction.numeral}</span>
          <span className="fn-dot">·</span>
          <span className="fn-label">{harmonicFunction.label}</span>
        </div>
      )}

      {/* Emotion card */}
      {emotion && (
        <div
          className="emotion-card"
          style={{ borderColor: emotion.color + '30' }}
        >
          <div className="emotion-section-label">feeling</div>
          <div className="emotion-label" style={{ color: emotion.color }}>
            {emotion.label}
          </div>
          <div className="emotion-desc">{emotion.description}</div>
        </div>
      )}

      {/* Active notes */}
      {chord.notes && chord.notes.length > 0 && (
        <div className="notes-section">
          <div className="emotion-section-label">notes</div>
          <div className="notes-row">
            {chord.notes.map((n) => (
              <span
                key={n}
                className="note-pill"
                style={{
                  background: (emotion?.color || '#F4C430') + '18',
                  color: emotion?.color || '#F4C430',
                }}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Key context */}
      {inferredKey && (
        <div className="key-section">
          <div className="emotion-section-label">key context</div>
          <div className="key-line">
            {inferredKey.tonic} {inferredKey.mode}
            <span className="key-confidence">
              {' '}({Math.round(inferredKey.confidence * 100)}% fit)
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
