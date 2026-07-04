/**
 * AudioEngine — Drift spec §6.
 * Plays the real, curated MP3 tracks. Each track is routed through Web Audio
 * (MediaElementSource → master gain → destination) so the SleepFader can fade it
 * and an AnalyserNode can drive the equalizer. Tracks loop seamlessly.
 */

import { SleepFader } from './SleepFader'

export class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private fader: SleepFader | null = null
  private _analyser: AnalyserNode | null = null

  private el: HTMLAudioElement | null = null
  private src: MediaElementAudioSourceNode | null = null

  private _volume = 0.85
  private _muted = false
  private breathCycle = 6

  get volume() {
    return this._volume
  }
  get muted() {
    return this._muted
  }

  /** Sound on/off — gently ramps the master gain to 0 (or back) without pausing. */
  setMuted(m: boolean) {
    this._muted = m
    if (!this.ctx || !this.master) return
    const now = this.ctx.currentTime
    const g = this.master.gain
    g.cancelScheduledValues(now)
    g.setValueAtTime(Math.max(g.value, 0.0001), now)
    g.linearRampToValueAtTime(m ? 0.0001 : this._volume, now + 0.35)
  }
  get analyser(): AnalyserNode | null {
    return this._analyser
  }

  /** Time-based breath envelope 0..1 for the gradient luminosity sync. */
  breathEnvelope(): number {
    const t = this.ctx ? this.ctx.currentTime : performance.now() / 1000
    return 0.5 + 0.5 * Math.sin((t / this.breathCycle) * Math.PI * 2)
  }

  private ensure(): AudioContext {
    if (this.ctx) return this.ctx
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    this.ctx = ctx
    this.master = ctx.createGain()
    this.master.gain.value = this._volume
    this._analyser = ctx.createAnalyser()
    this._analyser.fftSize = 256
    this._analyser.smoothingTimeConstant = 0.8
    this.master.connect(ctx.destination)
    this.master.connect(this._analyser)
    this.fader = new SleepFader(ctx, this.master)
    return ctx
  }

  /** Start a track: load, loop, route through the graph, and fade in over 3s. */
  async play(url: string, breathCycle = 6) {
    const ctx = this.ensure()
    if (ctx.state === 'suspended') await ctx.resume()
    this.stop()
    this._muted = false
    this.breathCycle = breathCycle

    const el = new Audio(url)
    el.loop = true
    el.preload = 'auto'
    el.crossOrigin = 'anonymous'
    this.el = el
    const src = ctx.createMediaElementSource(el)
    src.connect(this.master!)
    this.src = src

    try {
      await el.play()
    } catch {
      /* autoplay blocked until a gesture; caller invokes from a tap */
    }
    this.fader!.fadeIn(this._volume, 3)
  }

  beginSleepFade(seconds = 180) {
    this.fader?.fadeToSilence(seconds)
  }

  fadeOut(seconds = 8) {
    this.ctx?.resume()
    this.fader?.fadeToSilence(seconds)
    window.setTimeout(() => this.stop(), seconds * 1000 + 150)
  }

  /** Gently duck the volume, then pause — avoids the MP3 click on hard pause. */
  pause() {
    if (!this.ctx || !this.master || !this.el) return
    const now = this.ctx.currentTime
    const g = this.master.gain
    g.cancelScheduledValues(now)
    g.setValueAtTime(Math.max(g.value, 0.0001), now)
    g.linearRampToValueAtTime(0.0001, now + 0.35)
    const el = this.el
    window.setTimeout(() => el.pause(), 380)
  }

  /** Resume playback and gently fade the volume back in. */
  resume() {
    if (!this.ctx || !this.master) return
    this.ctx.resume()
    this.el?.play().catch(() => {})
    const now = this.ctx.currentTime
    const g = this.master.gain
    g.cancelScheduledValues(now)
    g.setValueAtTime(0.0001, now)
    g.linearRampToValueAtTime(this._muted ? 0.0001 : this._volume, now + 0.35)
  }

  setVolume(v: number) {
    this._volume = Math.max(0, Math.min(1, v))
    if (this.master && this.ctx && !this._muted) {
      this.master.gain.setTargetAtTime(this._volume, this.ctx.currentTime, 0.05)
    }
  }

  stop() {
    if (this.el) {
      this.el.pause()
      this.el.src = ''
    }
    try {
      this.src?.disconnect()
    } catch {
      /* noop */
    }
    this.src = null
    this.el = null
  }
}

// Singleton — one engine per app, like a single ExoPlayer instance.
export const audioEngine = new AudioEngine()
