import { useEffect, useRef } from 'react'
import { FUNCTION_COLORS } from '../theory/emotionMap'

// Circle of fifths order (12 o'clock = C, clockwise)
const COF_NOTES = ['C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'D♭', 'A♭', 'E♭', 'B♭', 'F']

/**
 * The main harmonic visualization.
 * - Outer ring: circle of fifths with inferred key highlighted
 * - Center: current chord with color aura
 * - Orbit: next-chord suggestions at varying distances/sizes
 */
export function HarmonicMap({ currentChord, nextChords, inferredKey, emotionColor }) {
  const canvasRef = useRef(null)
  // Track animation frame for cleanup
  const rafRef = useRef(null)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const SIZE = canvas.width
    const cx = SIZE / 2
    const cy = SIZE / 2

    let startTime = null

    function draw(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = (timestamp - startTime) / 1000 // seconds
      timeRef.current = elapsed

      ctx.clearRect(0, 0, SIZE, SIZE)

      // ── Background ──────────────────────────────────────────────────
      ctx.fillStyle = '#0d0d1a'
      ctx.fillRect(0, 0, SIZE, SIZE)

      const ringR = SIZE * 0.40    // outer ring radius
      const orbitR = SIZE * 0.27   // where suggestions orbit
      const centerR = SIZE * 0.12  // current chord orb radius

      // ── Circle of fifths ring ────────────────────────────────────────
      const segAngle = (2 * Math.PI) / 12
      const inferredChroma = inferredKey
        ? getChromaOfNote(inferredKey.tonic)
        : -1

      COF_NOTES.forEach((note, i) => {
        const startA = i * segAngle - Math.PI / 2
        const endA = startA + segAngle
        const noteChroma = cofChroma(i) // chroma for this COF position

        const isCurrentKey = inferredKey && noteChroma === inferredChroma

        // Segment fill
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, ringR, startA, endA)
        ctx.closePath()
        ctx.fillStyle = isCurrentKey
          ? (emotionColor ? hexToRgba(emotionColor, 0.22) : 'rgba(244,196,48,0.22)')
          : 'rgba(255,255,255,0.025)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'
        ctx.lineWidth = 0.5
        ctx.stroke()

        // Note label
        const labelA = startA + segAngle / 2
        const labelR = ringR * 0.80
        const lx = cx + Math.cos(labelA) * labelR
        const ly = cy + Math.sin(labelA) * labelR

        ctx.font = isCurrentKey ? '500 13px system-ui' : '12px system-ui'
        ctx.fillStyle = isCurrentKey
          ? (emotionColor || '#F4C430')
          : 'rgba(255,255,255,0.45)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(note, lx, ly)
      })

      // ── Inner ring border ────────────────────────────────────────────
      ctx.beginPath()
      ctx.arc(cx, cy, ringR * 0.56, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 0.5
      ctx.stroke()

      // ── Suggestion orbits ─────────────────────────────────────────────
      if (nextChords && nextChords.length > 0) {
        const topN = nextChords.slice(0, 5)
        topN.forEach((sug, i) => {
          // Slowly rotate while chord is held
          const baseAngle = (i / topN.length) * 2 * Math.PI - Math.PI / 2
          const driftAngle = baseAngle + elapsed * 0.15 // slow rotation
          const sx = cx + Math.cos(driftAngle) * orbitR
          const sy = cy + Math.sin(driftAngle) * orbitR

          const alpha = 0.35 + sug.weight * 0.65
          const orbR = 14 + sug.weight * 12

          // Connection line (dashed)
          ctx.setLineDash([3, 4])
          ctx.beginPath()
          ctx.moveTo(cx, cy)
          ctx.lineTo(sx, sy)
          ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.18})`
          ctx.lineWidth = sug.weight * 2
          ctx.stroke()
          ctx.setLineDash([])

          // Suggestion orb
          const sugColor = FUNCTION_COLORS[DEGREE_TO_FUNCTION[sug.degree]] || '#94A3B8'
          ctx.beginPath()
          ctx.arc(sx, sy, orbR, 0, Math.PI * 2)
          ctx.fillStyle = hexToRgba(sugColor, alpha * 0.12)
          ctx.fill()
          ctx.strokeStyle = hexToRgba(sugColor, alpha * 0.7)
          ctx.lineWidth = 1
          ctx.stroke()

          // Chord label
          ctx.font = sug.weight > 0.75 ? '500 12px system-ui' : '11px system-ui'
          ctx.fillStyle = hexToRgba(sugColor, alpha)
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(sug.chord || sug.numeral, sx, sy)
        })
      }

      // ── Empty state ring ──────────────────────────────────────────────
      if (!currentChord) {
        ctx.beginPath()
        ctx.arc(cx, cy, centerR, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.stroke()
        ctx.setLineDash([])
        ctx.font = '12px system-ui'
        ctx.fillStyle = 'rgba(255,255,255,0.2)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('play something', cx, cy)
      }

      // ── Current chord orb ─────────────────────────────────────────────
      if (currentChord) {
        const auraColor = emotionColor || '#F4C430'

        // Pulsing aura
        const pulse = 0.85 + Math.sin(elapsed * 2.5) * 0.15
        const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, centerR * 2.2 * pulse)
        aura.addColorStop(0, hexToRgba(auraColor, 0.3))
        aura.addColorStop(0.5, hexToRgba(auraColor, 0.1))
        aura.addColorStop(1, hexToRgba(auraColor, 0))
        ctx.beginPath()
        ctx.arc(cx, cy, centerR * 2.2 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = aura
        ctx.fill()

        // Core orb
        ctx.beginPath()
        ctx.arc(cx, cy, centerR, 0, Math.PI * 2)
        ctx.fillStyle = hexToRgba(auraColor, 0.18)
        ctx.fill()
        ctx.strokeStyle = hexToRgba(auraColor, 0.9)
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Chord symbol
        ctx.font = '500 22px system-ui'
        ctx.fillStyle = auraColor
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(currentChord.symbol, cx, cy - 4)

        // Quality hint below
        if (currentChord.type) {
          ctx.font = '10px system-ui'
          ctx.fillStyle = hexToRgba(auraColor, 0.5)
          ctx.fillText(currentChord.type, cx, cy + 12)
        }
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [currentChord, nextChords, inferredKey, emotionColor])

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={480}
      style={{ borderRadius: '50%', display: 'block' }}
    />
  )
}

// ── Helpers ─────────────────────────────────────────────────────────────────

// Map from 0-indexed degree to function name for color lookup
const DEGREE_TO_FUNCTION = {
  0: 'tonic',
  1: 'supertonic',
  2: 'mediant',
  3: 'subdominant',
  4: 'dominant',
  5: 'submediant',
  6: 'leading',
}

// Chroma for each circle-of-fifths position (0=C, 1=G, 2=D, ...)
const COF_CHROMA = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]
function cofChroma(i) {
  return COF_CHROMA[i]
}

function getChromaOfNote(noteName) {
  if (!noteName) return -1
  // Handle ♭ / ♯ as well as b / #
  const cleaned = noteName.replace('♭', 'b').replace('♯', '#')
  const noteMap = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
  }
  return noteMap[cleaned] ?? -1
}

function hexToRgba(hex, alpha) {
  if (!hex || !hex.startsWith('#')) return `rgba(148,163,184,${alpha})`
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
