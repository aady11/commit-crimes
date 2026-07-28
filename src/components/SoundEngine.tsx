// Lightweight Web Audio sound engine for game feedback
// No external library — just the native Web Audio API

const AudioCtx = window.AudioContext || (window as any).webkitAudioContext

let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioCtx()
  return ctx
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  const c = getCtx()
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime)
  gain.gain.setValueAtTime(volume, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(c.currentTime)
  osc.stop(c.currentTime + duration)
}

export const sounds = {
  click: () => playTone(800, 0.08, 'square', 0.08),
  success: () => {
    playTone(523, 0.15, 'sine', 0.12)
    setTimeout(() => playTone(659, 0.15, 'sine', 0.12), 150)
    setTimeout(() => playTone(784, 0.3, 'sine', 0.15), 300)
  },
  error: () => playTone(200, 0.3, 'square', 0.1),
  undo: () => playTone(400, 0.1, 'triangle', 0.08),
  hover: () => playTone(1200, 0.04, 'sine', 0.04),
  levelStart: () => {
    playTone(440, 0.1, 'triangle', 0.1)
    setTimeout(() => playTone(554, 0.1, 'triangle', 0.1), 100)
  },
  commit: () => playTone(660, 0.12, 'sine', 0.1),
  branch: () => playTone(880, 0.15, 'triangle', 0.08),
  merge: () => {
    playTone(440, 0.2, 'sine', 0.1)
    setTimeout(() => playTone(660, 0.25, 'sine', 0.12), 200)
  },
  delete: () => playTone(150, 0.2, 'square', 0.06),
  celebration: () => {
    const notes = [523, 659, 784, 1047]
    notes.forEach((n, i) => {
      setTimeout(() => playTone(n, 0.2, 'sine', 0.12), i * 120)
    })
  },
}