import { create } from 'zustand'

export const useStore = create((set) => ({
  // MIDI
  activeNotes: [],       // array of MIDI note numbers currently held down
  midiStatus: 'pending', // 'pending' | 'ready' | 'no-device' | 'unsupported' | 'denied'

  // Theory state (derived from activeNotes, set by App)
  currentChord: null,    // { symbol, tonic, type, ... }
  inferredKey: null,     // { tonic: 'C', mode: 'major', confidence: 0.9 }
  harmonicFunction: null, // { numeral: 'I', label: 'Tonic', function: 'tonic', degree: 1 }
  nextChords: [],         // [{ chord, numeral, weight, degree }]

  // History — stores chord symbol strings, not objects
  progressionHistory: [], // last 20 chord symbol strings

  // Actions
  setActiveNotes: (notes) => set({ activeNotes: notes }),
  setMidiStatus: (status) => set({ midiStatus: status }),

  setTheoryState: (chord, key, fn, suggestions) =>
    set((state) => {
      const incoming = chord?.symbol ?? null
      const last = state.progressionHistory[state.progressionHistory.length - 1]

      // Only append when the chord symbol actually changes
      const history =
        incoming && incoming !== last
          ? [...state.progressionHistory.slice(-19), incoming]
          : state.progressionHistory

      return {
        currentChord:     chord,
        inferredKey:      key,
        harmonicFunction: fn,
        nextChords:       suggestions,
        progressionHistory: history,
      }
    }),
}))
