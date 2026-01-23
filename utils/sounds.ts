
/**
 * Web Audio API Sound Generator for RuggedDev
 * Provides loud, military-themed mechanical and terminal-style sound effects.
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = localStorage.getItem('rugged_sound_enabled') !== 'false';

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    localStorage.setItem('rugged_sound_enabled', String(enabled));
  }

  isSoundEnabled() {
    return this.soundEnabled;
  }

  /** Subtle mechanical click for buttons */
  playClick() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  /** Heavy mechanical relay click for tactical toggle switches */
  playRelayClick() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    
    // First click
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(400, this.ctx.currentTime);
    gain1.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    
    // Second trailing click (echo)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(300, this.ctx.currentTime + 0.03);
    gain2.gain.setValueAtTime(0.1, this.ctx.currentTime + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);

    osc1.start();
    osc1.stop(this.ctx.currentTime + 0.05);
    osc2.start(this.ctx.currentTime + 0.03);
    osc2.stop(this.ctx.currentTime + 0.08);
  }

  /** Aggressive command strike with noise burst for primary actions */
  playCommandClick() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    
    // Main tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    // Noise burst for "mechanical thud"
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    noise.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
    noise.start();
  }

  /** Heavy industrial engine/static hum */
  playSystemHum() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(45, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.8);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.8);
  }

  /** Military radio "roger" beep for task completion */
  playNeutralBlip() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    
    // Double beep
    const time = this.ctx.currentTime;
    [0, 0.12].forEach((offset) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, time + offset);
      gain.gain.setValueAtTime(0.15, time + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, time + offset + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time + offset);
      osc.stop(time + offset + 0.08);
    });
  }

  /** Tactical slide sound for FAQ expansion */
  playExpand(isOpening: boolean) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const startFreq = isOpening ? 100 : 300;
    const endFreq = isOpening ? 300 : 100;

    osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  /** Glitchy dramatic sound for the Rug Pull action */
  playRug() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    
    // Noise Burst
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.5);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    // Deep Plunge Tone
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 1.5);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.5);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    noise.start();
    osc.start();
    osc.stop(this.ctx.currentTime + 2);
  }
}

export const sounds = new SoundService();
