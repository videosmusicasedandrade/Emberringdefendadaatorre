class SoundEngine {
  private ctx: AudioContext | null = null;
  public mutedMusic = false;
  public mutedSfx = false;
  private musicTimer: ReturnType<typeof setTimeout> | null = null;
  private musicStep = 0;
  private musicRunning = false;
  private currentWave = 1;
  private isBossIntensity = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMutedMusic(muted: boolean) {
    this.mutedMusic = muted;
    if (muted) {
      this.stopMusic();
    }
  }

  public setMutedSfx(muted: boolean) {
    this.mutedSfx = muted;
  }

  public setMusicIntensity(wave: number, bossActive: boolean) {
    this.currentWave = Math.max(1, wave);
    this.isBossIntensity = bossActive;
  }

  private getMusicStepIntervalMs(): number {
    if (this.isBossIntensity) return 210;
    if (this.currentWave >= 8) return 245;
    if (this.currentWave >= 5) return 290;
    return 355;
  }

  private scheduleMusicStep() {
    if (!this.musicRunning || this.mutedMusic || typeof window === 'undefined') return;
    const leadNormal = [220, 261.63, 329.63, 392.0, 440.0, 392.0, 329.63, 293.66];
    const leadIntense = [220, 261.63, 329.63, 440.0, 493.88, 440.0, 349.23, 329.63];
    const bass = [110, 110, 130.81, 98.0];

    const stepMs = this.getMusicStepIntervalMs();
    this.musicTimer = setTimeout(() => {
      if (!this.musicRunning || this.mutedMusic) return;
      const ctx = this.ensureContext();
      if (ctx && ctx.state === 'running') {
        const now = ctx.currentTime;
        const intense = this.isBossIntensity || this.currentWave >= 8;
        const melodyPool = intense ? leadIntense : leadNormal;
        const melodyFreq = melodyPool[this.musicStep % melodyPool.length];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = intense ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(melodyFreq, now);
        gain.gain.setValueAtTime(intense ? 0.02 : 0.022, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (intense ? 0.21 : 0.28));
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);

        if (this.musicStep % (intense ? 1 : 2) === 0) {
          const bassFreq = bass[Math.floor(this.musicStep / 2) % bass.length];
          const bOsc = ctx.createOscillator();
          const bGain = ctx.createGain();
          bOsc.type = intense ? 'triangle' : 'sine';
          bOsc.frequency.setValueAtTime(intense && this.musicStep % 2 === 1 ? bassFreq * 1.5 : bassFreq, now);
          bGain.gain.setValueAtTime(intense ? 0.048 : 0.036, now);
          bGain.gain.exponentialRampToValueAtTime(0.001, now + (intense ? 0.24 : 0.38));
          bOsc.connect(bGain).connect(ctx.destination);
          bOsc.start(now);
          bOsc.stop(now + 0.4);
        }

        this.musicStep = (this.musicStep + 1) % 16;
      }
      this.scheduleMusicStep();
    }, stepMs);
  }

  public startMusic() {
    if (this.mutedMusic || this.musicRunning || typeof window === 'undefined') return;
    this.musicRunning = true;
    this.scheduleMusicStep();
  }

  public stopMusic() {
    this.musicRunning = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private getSfxCtx(): AudioContext | null {
    if (this.mutedSfx) return null;
    return this.ensureContext();
  }

  public playClick() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(720, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.045);
    gain.gain.setValueAtTime(0.075, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  public playShoot() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const pitchVar = 0.94 + Math.random() * 0.14;
    osc.frequency.setValueAtTime(540 * pitchVar, now);
    osc.frequency.exponentialRampToValueAtTime(220 * pitchVar, now + 0.075);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.085);
  }

  public playArcherShot() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const pitchVar = 0.95 + Math.random() * 0.12;
    osc.frequency.setValueAtTime(920 * pitchVar, now);
    osc.frequency.exponentialRampToValueAtTime(340 * pitchVar, now + 0.065);
    gain.gain.setValueAtTime(0.085, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.075);
  }

  public playSwordCleave() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.13);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playBombLaunch() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(210, now);
    osc.frequency.exponentialRampToValueAtTime(390, now + 0.11);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playExplosion() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Deep sub-bass boom
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(145, now);
    sub.frequency.exponentialRampToValueAtTime(36, now + 0.24);
    subGain.gain.setValueAtTime(0.22, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    sub.connect(subGain).connect(ctx.destination);
    sub.start(now);
    sub.stop(now + 0.26);

    // Warm mid crunch
    const crunch = ctx.createOscillator();
    const crunchGain = ctx.createGain();
    crunch.type = 'triangle';
    crunch.frequency.setValueAtTime(220, now);
    crunch.frequency.exponentialRampToValueAtTime(55, now + 0.16);
    crunchGain.gain.setValueAtTime(0.11, now);
    crunchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
    crunch.connect(crunchGain).connect(ctx.destination);
    crunch.start(now);
    crunch.stop(now + 0.18);
  }

  public playShieldBash() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.14);
    gain.gain.setValueAtTime(0.13, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playSlash() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    const pitchVar = 0.94 + Math.random() * 0.12;
    osc.frequency.setValueAtTime(680 * pitchVar, now);
    osc.frequency.exponentialRampToValueAtTime(160 * pitchVar, now + 0.12);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  /**
   * Heavy, punchy low-end impact + crisp reward ping when defeating an enemy
   */
  public playKill() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Heavy punchy bass impact
    const thump = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(132, now);
    thump.frequency.exponentialRampToValueAtTime(38, now + 0.14);
    thumpGain.gain.setValueAtTime(0.19, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    thump.connect(thumpGain).connect(ctx.destination);
    thump.start(now);
    thump.stop(now + 0.16);

    // Subtle crisp coin-spark overtone
    const ping = ctx.createOscillator();
    const pingGain = ctx.createGain();
    ping.type = 'triangle';
    ping.frequency.setValueAtTime(880, now + 0.02);
    ping.frequency.exponentialRampToValueAtTime(1318.5, now + 0.09);
    pingGain.gain.setValueAtTime(0.045, now + 0.02);
    pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    ping.connect(pingGain).connect(ctx.destination);
    ping.start(now + 0.02);
    ping.stop(now + 0.12);
  }

  /**
   * Bright coin / bell chime when hero levels up or hits max evolution
   */
  public playLevelUp(isMax = false) {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = isMax
      ? [987.77, 1318.51, 1567.98, 1975.53, 2637.02]
      : [880, 1174.66, 1567.98, 2093.0];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = now + idx * 0.055;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  public playCombo(comboCount: number) {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const base = Math.min(1480, 660 + comboCount * 85);
    [base, base * 1.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + i * 0.045;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.075, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.17);
    });
  }

  public playDeploy() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.setValueAtTime(580, now + 0.055);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playMerge() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + idx * 0.042;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.085, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.23);
    });
  }

  public playSpellBlade() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.14);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.3);
    gain.gain.setValueAtTime(0.095, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.33);
  }

  public playSpellShockwave() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);
    gain.gain.setValueAtTime(0.19, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.37);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.38);
  }

  public playSpellOvercharge() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + i * 0.05;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.085, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.19);
    });
  }

  public playLowHpAlarm() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [0, 0.16].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(520, now + offset);
      osc.frequency.setValueAtTime(380, now + offset + 0.08);
      gain.gain.setValueAtTime(0.055, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.14);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.15);
    });
  }

  /**
   * Triumphant victory fanfare chord progression + high celebratory bell chime
   */
  public playVictory() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Bright ascending arpeggio into triumphant C-major9 sustained chord
    const lead = [523.25, 659.25, 783.99, 1046.5];
    lead.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + i * 0.085;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.36);
    });

    // Triumphant simultaneous chord hit at t + 0.34s
    const chord = [261.63, 329.63, 392.0, 493.88, 523.25, 1046.5];
    const chordStart = now + 0.34;
    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = freq > 700 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, chordStart);
      gain.gain.setValueAtTime(freq > 700 ? 0.075 : 0.065, chordStart);
      gain.gain.exponentialRampToValueAtTime(0.001, chordStart + 0.85);
      osc.connect(gain).connect(ctx.destination);
      osc.start(chordStart);
      osc.stop(chordStart + 0.86);
    });
  }

  public playDefeat() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [330, 293.66, 246.94, 196].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      const t = now + i * 0.12;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.075, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.33);
    });
  }

  public playBaseHit() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(135, now);
    osc.frequency.exponentialRampToValueAtTime(52, now + 0.2);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.21);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playHeroEvolve() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Deep confirmation pulse + crystalline ascending triad
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(160, now);
    sub.frequency.exponentialRampToValueAtTime(80, now + 0.18);
    subGain.gain.setValueAtTime(0.15, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    sub.connect(subGain).connect(ctx.destination);
    sub.start(now);
    sub.stop(now + 0.21);

    [587.33, 880, 1174.66, 1760].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 3 ? 'sine' : 'triangle';
      const t = now + idx * 0.048;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.095, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  public playGateOpen() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Dramatic gate breach horn + resonant chime
    const rumble = ctx.createOscillator();
    const rGain = ctx.createGain();
    rumble.type = 'sawtooth';
    rumble.frequency.setValueAtTime(110, now);
    rumble.frequency.exponentialRampToValueAtTime(65, now + 0.35);
    rGain.gain.setValueAtTime(0.12, now);
    rGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    rumble.connect(rGain).connect(ctx.destination);
    rumble.start(now);
    rumble.stop(now + 0.4);

    [392.0, 523.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + 0.08 + i * 0.09;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.34);
    });
  }

  public playConvergenceAlert() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [440, 554.37, 659.25, 880, 1108.73].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + i * 0.065;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.36);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.38);
    });
  }

  public playShieldHit() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1120, now);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.085);
    gain.gain.setValueAtTime(0.065, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playElementalCombustion() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const boom = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boom.type = 'sawtooth';
    boom.frequency.setValueAtTime(170, now);
    boom.frequency.exponentialRampToValueAtTime(42, now + 0.34);
    boomGain.gain.setValueAtTime(0.14, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    boom.connect(boomGain).connect(ctx.destination);
    boom.start(now);
    boom.stop(now + 0.38);

    const sizzle = ctx.createOscillator();
    const sizzleGain = ctx.createGain();
    sizzle.type = 'triangle';
    sizzle.frequency.setValueAtTime(840, now + 0.03);
    sizzle.frequency.exponentialRampToValueAtTime(1560, now + 0.24);
    sizzleGain.gain.setValueAtTime(0.075, now + 0.03);
    sizzleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    sizzle.connect(sizzleGain).connect(ctx.destination);
    sizzle.start(now + 0.03);
    sizzle.stop(now + 0.28);
  }

  public playCritImpact() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(980, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.085);
    gain.gain.setValueAtTime(0.075, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playAchievement() {
    const ctx = this.getSfxCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [587.33, 739.99, 880.0, 1174.66].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + i * 0.075;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.42);
    });
  }
}

export const soundEngine = new SoundEngine();
