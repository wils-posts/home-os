class SoundManager {
  constructor() {
    this.ctx = null
    this.initialized = false
  }

  ensureContext() {
    if (this.ctx) return this.ctx
    try {
      this.ctx = new AudioContext()
      return this.ctx
    } catch {
      return null
    }
  }

  async initialize() {
    if (this.initialized) return
    const ctx = this.ensureContext()
    if (!ctx) return
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }
    this.initialized = true
  }

  playTick() {
    const ctx = this.ensureContext()
    if (!ctx) return
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.04)
  }

  playCelebration() {
    const ctx = this.ensureContext()
    if (!ctx) return
    const notes = [523.25, 659.25, 783.99]  // C5, E5, G5
    for (let i = 0; i < notes.length; i++) {
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.frequency.value = notes[i]
      oscillator.type = 'sine'
      const start = ctx.currentTime + i * 0.08
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.1, start + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4)
      oscillator.start(start)
      oscillator.stop(start + 0.4)
    }
  }
}

export const soundManager = new SoundManager()
