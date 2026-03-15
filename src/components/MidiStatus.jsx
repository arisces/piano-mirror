export function MidiStatus({ status }) {
  if (status === 'ready') return null

  const messages = {
    pending: { text: 'Requesting MIDI access…', color: '#94A3B8' },
    'no-device': {
      text: 'No MIDI device found. Plug in your keyboard and refresh.',
      color: '#F4C430',
    },
    unsupported: {
      text: 'Web MIDI is not supported in this browser. Use Chrome or Edge.',
      color: '#E25C3B',
    },
    denied: {
      text: 'MIDI access was denied. Allow it in browser settings and refresh.',
      color: '#E25C3B',
    },
  }

  const { text, color } = messages[status] || messages.pending

  return (
    <div
      className="midi-status-banner"
      style={{ background: color + '18', borderColor: color + '40', color }}
    >
      <span className="midi-status-dot" style={{ background: color }} />
      {text}
    </div>
  )
}
