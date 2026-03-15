import { useEffect } from 'react'
import { useStore } from '../store/useStore'

export function useMidi() {
  const setActiveNotes = useStore((s) => s.setActiveNotes)
  const setMidiStatus = useStore((s) => s.setMidiStatus)

  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      setMidiStatus('unsupported')
      return
    }

    // A Set so we handle note-on/off correctly regardless of order
    const heldNotes = new Set()
    const inputs = new Map()

    const handleMessage = (msg) => {
      const [status, note, velocity] = Array.from(msg.data)
      const command = status & 0xf0

      if (command === 0x90 && velocity > 0) {
        heldNotes.add(note)
      } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
        heldNotes.delete(note)
      }

      setActiveNotes([...heldNotes])
    }

    const bindInputs = (midiAccess) => {
      // Unbind old listeners
      inputs.forEach((input) => { input.onmidimessage = null })
      inputs.clear()

      midiAccess.inputs.forEach((input) => {
        input.onmidimessage = handleMessage
        inputs.set(input.id, input)
      })

      setMidiStatus(midiAccess.inputs.size > 0 ? 'ready' : 'no-device')
    }

    navigator.requestMIDIAccess({ sysex: false }).then(
      (midiAccess) => {
        bindInputs(midiAccess)
        // Fires when devices are plugged/unplugged
        midiAccess.onstatechange = () => bindInputs(midiAccess)
      },
      () => {
        setMidiStatus('denied')
      }
    )

    return () => {
      inputs.forEach((input) => { input.onmidimessage = null })
    }
  }, [setActiveNotes, setMidiStatus])
}
