/**
 * Maps Tonal.js chord type strings → emotional / visual properties.
 * These are default associations — in V2 they become personally calibrated.
 * Colors are plain hex so Canvas can consume them directly.
 */
const EMOTION_BY_TYPE = {
  'major': {
    label: 'Bright & stable',
    description: 'Home base. Settled. Can go anywhere from here.',
    color: '#F4C430',
  },
  'minor': {
    label: 'Introspective',
    description: 'Turns inward. Melancholic warmth. Rich inner world.',
    color: '#6B7FD4',
  },
  'dominant seventh': {
    label: 'Tense & driving',
    description: 'Pulls hard toward resolution. Wants to move. Urgency.',
    color: '#E25C3B',
  },
  'major seventh': {
    label: 'Dreamy & lush',
    description: "Floats. Sophisticated. Doesn't want to resolve yet.",
    color: '#C084FC',
  },
  'minor seventh': {
    label: 'Mellow & cool',
    description: 'Relaxed tension. Jazz-infused ease. Room to breathe.',
    color: '#2DD4BF',
  },
  'diminished': {
    label: 'Dark & unstable',
    description: 'Maximum tension. Unstable by design. Wants to resolve up.',
    color: '#7C3AED',
  },
  'half-diminished': {
    label: 'Yearning',
    description: 'Somewhere between minor and diminished. Searching.',
    color: '#9333EA',
  },
  'augmented': {
    label: 'Ethereal & strange',
    description: 'Symmetrical, ambiguous. Neither major nor minor. Floating.',
    color: '#F472B6',
  },
  'suspended fourth': {
    label: 'Suspended',
    description: 'Held breath. Waiting for the 3rd to decide.',
    color: '#34D399',
  },
  'suspended second': {
    label: 'Open & airy',
    description: 'Spacious. Ambiguous mode. Sky-like quality.',
    color: '#6EE7B7',
  },
  'minor major seventh': {
    label: 'Bittersweet',
    description: 'Minor feel with a bright top. Conflicted beauty.',
    color: '#FB7185',
  },
  'dominant ninth': {
    label: 'Rich tension',
    description: 'Dominant with extra color. Jazzy urgency.',
    color: '#F97316',
  },
  'major sixth': {
    label: 'Warm & complete',
    description: 'Major with added sweetness. Nostalgic, resolved.',
    color: '#FCD34D',
  },
  'minor sixth': {
    label: 'Tender sadness',
    description: 'Minor with a bittersweet brightness on top.',
    color: '#818CF8',
  },
}

/** Harmonic function → accent color. Used for next-chord orbs. */
export const FUNCTION_COLORS = {
  tonic:       '#F4C430',
  subdominant: '#4A9EFF',
  dominant:    '#E25C3B',
  supertonic:  '#A78BFA',
  mediant:     '#34D399',
  submediant:  '#F472B6',
  leading:     '#FB923C',
  chromatic:   '#94A3B8',
}

const DEFAULT_EMOTION = {
  label: 'Uncharted',
  description: 'Unrecognized combination. Experiment freely.',
  color: '#94A3B8',
}

/**
 * Get the emotion profile for a given Tonal chord type string.
 * @param {string} chordType  e.g. "major", "dominant seventh"
 */
export function getEmotion(chordType) {
  if (!chordType) return DEFAULT_EMOTION
  return EMOTION_BY_TYPE[chordType] ?? DEFAULT_EMOTION
}
