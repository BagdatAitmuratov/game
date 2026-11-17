// Gentle procedural Web Audio synthesizer for kids background music and tactile SFX
// Runs cleanly offline and inside Capacitor Android WebView without external audio files.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicTimer: number | null = null;
  private step = 0;
  private musicEnabled = true;
  private sfxEnabled = true;
  private unlocked = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setPreferences(music: boolean, sfx: boolean) {
    this.musicEnabled = music;
    this.sfxEnabled = sfx;
    if (!music) {
      this.stopMusic();
    } else if (this.unlocked) {
      this.startMusic();
    }
  }

  public unlock() {
    this.unlocked = true;
    const ctx = this.ensureContext();
    if (ctx && this.musicEnabled && this.musicTimer === null) {
      this.startMusic();
    }
  }

  public startMusic() {
    if (!this.musicEnabled || typeof window === 'undefined') return;
    if (this.musicTimer !== null) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    // Gentle C-major pentatonic music-box melody (C5, D5, E5, G5, A5, C6)
    const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 659.25, 880.0, 783.99, 523.25, 587.33, 659.25, 783.99, 1046.5, 880.0, 783.99, 659.25];
    const bass = [261.63, 261.63, 220.0, 220.0, 174.61, 174.61, 196.0, 196.0];

    this.musicTimer = window.setInterval(() => {
      if (!this.musicEnabled || !this.ctx || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime;
      const note = melody[this.step % melody.length];

      // Soft marimba/celesta note
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.028, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);

      // Warm bass pad every 2 beats
      if (this.step % 2 === 0) {
        const bFreq = bass[Math.floor(this.step / 2) % bass.length];
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'triangle';
        bOsc.frequency.setValueAtTime(bFreq, now);
        bGain.gain.setValueAtTime(0.0001, now);
        bGain.gain.exponentialRampToValueAtTime(0.018, now + 0.08);
        bGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
        bOsc.connect(bGain);
        bGain.connect(this.ctx.destination);
        bOsc.start(now);
        bOsc.stop(now + 0.9);
      }

      this.step = (this.step + 1) % 64;
    }, 480);
  }

  public stopMusic() {
    if (this.musicTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.08, delay = 0) {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playTap() {
    this.playTone(540, 0.08, 'sine', 0.07);
  }

  public playFlip() {
    this.playTone(460, 0.09, 'triangle', 0.06);
  }

  public playMove() {
    this.playTone(392, 0.07, 'sine', 0.06);
  }

  public playMatch() {
    this.playTone(587.33, 0.12, 'sine', 0.08, 0);
    this.playTone(880.0, 0.18, 'sine', 0.08, 0.07);
  }

  public playError() {
    this.playTone(240, 0.14, 'triangle', 0.07, 0);
    this.playTone(195, 0.16, 'triangle', 0.06, 0.09);
  }

  public playSimonTone(index: number) {
    const freqs = [329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
    this.playTone(freqs[index % freqs.length], 0.28, 'sine', 0.11);
  }

  public playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.22, 'triangle', 0.09, idx * 0.09);
    });
  }
}

export const soundEngine = new SoundEngine();
