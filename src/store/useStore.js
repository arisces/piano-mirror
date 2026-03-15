import { create } from 'zustand'

export const useStore = create((set) => ({
  // MIDI
  activeNotes: [],       // array of MIDI note numbers currently held down
  midiStatus: 'pending', // 'pending' | 'ready' | 'no-device' | 'unsupported' | 'denied'

  // Theory state (derived from activeNotes, set by App)
  currentChord: null,    // e.g. "CM", "Am7", "G7"
  inferredKey: null,     // { tonic: 'C', mode: 'major', confidence: 0.9 }
  harmonicFunction: null, // { numeral: 'I', label: 'Tonic', function: 'tonic', degree: 1 }
  nextChords: [],         // [{ chord, numeral, weight, degree }]

  // History
  progressionHistory: [], // last 20 chord names

  // Actions
  setActiveNotes: (notes) => set({ activeNotes: notes }),
  setMidiStatus: (status) => set({ midiStatus: status }),

  setTheoryState: (chord, key, fn, suggestions) =>
    set((state) => {
      const history =
        chord && chord !== state.currentChord
          ? [...state.progressionHistory.slice(-19), chord]
          : state.progressionHistory

      return {
        currentChord: chord,
        inferredKey: key,
        harmonicFunction: fn,
        nextChords: suggestions,
        progressionHistory: history,
      }
    }),
}))
