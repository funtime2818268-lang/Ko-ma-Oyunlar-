/**
 * Web Audio API Sound Synthesizer & Turkish Voice Lines Engine
 */

export const VOICE_QUOTES = {
  bibendum: {
    jump: [
      "Hadi bakalım hop ulan!",
      "Tekerlek gibi zıpladım amk!",
      "Uçuyorum lan ibne engel!",
      "Zıpla ulan tonton adam!"
    ],
    slide: [
      "Yat yere amk!",
      "Kaysana lan göbüş!",
      "Eğil amına koyayım!",
      "Altından geçtim piç!"
    ],
    collect: [
      "Ver ulan lastiğimi amk!",
      "Lastik benim amına koyayım!",
      "Hah işte böle lastik topla!"
    ],
    shield: [
      "Kalkanımı siktiniz amk!",
      "Has siktir shield gitti!"
    ],
    hit: [
      "Gözünü sikiim neresi burası!",
      "Ulan kafama çarptı amk!",
      "Has siktir babayı aldık!"
    ],
    gameover: [
      "Vurgun yedik amk teker patladı!",
      "Senin yapacağın sürüşü sikeyim!",
      "Gitti ulan canlar amına koyayım!"
    ]
  },
  baldi: {
    jump: [
      "2 kere 2 dört eder ulan!",
      "Matematik hocasını zıplatmayın amk!",
      "Hoppa ders başladı piçler!",
      "Zıpla lan sıfırcı!"
    ],
    slide: [
      "Cetveli güt amk!",
      "Eğil ulan ders başlıyor!",
      "Kafana cetvelle vuracam ha!"
    ],
    collect: [
      "Cetvelim nerede amk!",
      "Al sana 2X puan piç!",
      "Puanlar benim amına koyayım!"
    ],
    hit: [
      "Yanlış cevap verdin amk!",
      "Oğlum kağıdına bakma sikeyim!",
      "Ulan cetvel kırıldı amk!"
    ],
    gameover: [
      "Sıfır aldın amına koyayım!",
      "Dersten kaldın oç!",
      "Senin matematiğini sikeyim!"
    ]
  },
  neighbor: {
    jump: [
      "Evimden uzak dur amk!",
      "Çift zıplarım belanı sikerim!",
      "Zıpla lan koca bıyık!"
    ],
    slide: [
      "Bodruma saklan amk!",
      "Eğil lan komşu geliyor!",
      "Görmesin piçler!"
    ],
    collect: [
      "Bodrumun anahtarı amk!",
      "Anahtar bende olum!",
      "Kapıyı kilitlerim piç!"
    ],
    hit: [
      "Bıyığımı bozdun amına koyayım!",
      "Lan git evimden oç!",
      "Kafamı kırdın piç!"
    ],
    gameover: [
      "Seni bodruma kilitledim piç!",
      "Bitti lan oyun siktir git!",
      "Evimi mahvettiniz amk!"
    ]
  }
};

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isVoiceEnabled: boolean = true;
  private lastVoiceTime: number = 0;

  constructor() {
    // Lazy init audio context on first user touch/click
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public speakVoice(charId: 'bibendum' | 'baldi' | 'neighbor', action: 'jump' | 'slide' | 'collect' | 'shield' | 'hit' | 'gameover'): string | null {
    if (this.isMuted || !this.isVoiceEnabled) return null;

    const now = Date.now();
    // Throttle routine jump/slide voice calls to avoid audio spam
    if ((action === 'jump' || action === 'slide') && now - this.lastVoiceTime < 1800) {
      return null;
    }
    this.lastVoiceTime = now;

    const charQuotes = VOICE_QUOTES[charId];
    if (!charQuotes) return null;
    const quotesList = (charQuotes as Record<string, string[]>)[action];
    if (!quotesList || quotesList.length === 0) return null;

    const randomText = quotesList[Math.floor(Math.random() * quotesList.length)];

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // cancel previous phrase
        const utterance = new SpeechSynthesisUtterance(randomText);
        utterance.lang = 'tr-TR';

        // Pitch & rate per character personality
        if (charId === 'bibendum') {
          utterance.pitch = 0.85; // Deep fat voice
          utterance.rate = 1.1;
        } else if (charId === 'baldi') {
          utterance.pitch = 1.3; // High nerdy voice
          utterance.rate = 1.25;
        } else {
          utterance.pitch = 0.7; // Grumpy neighbor voice
          utterance.rate = 1.0;
        }

        window.speechSynthesis.speak(utterance);
      } catch {
        // Fallback silently if speech synthesis unsupported
      }
    }

    return randomText;
  }

  public playJump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(480, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public playDoubleJump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  public playSlide() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  public playCollect(type: string = 'coin') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const freq1 = type === 'tire' ? 523.25 : type === 'ruler' ? 659.25 : 783.99; // C5, E5, G5
    const freq2 = freq1 * 1.5;

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(freq1, this.ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(freq2, this.ctx.currentTime + 0.12);

    osc2.frequency.setValueAtTime(freq2, this.ctx.currentTime + 0.04);
    osc2.frequency.exponentialRampToValueAtTime(freq2 * 1.25, this.ctx.currentTime + 0.16);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start(this.ctx.currentTime + 0.04);
    osc1.stop(this.ctx.currentTime + 0.2);
    osc2.stop(this.ctx.currentTime + 0.2);
  }

  public playHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  public playShieldBreak() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    // High sparkling chime
    const notes = [800, 1200, 1600, 2000];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.03);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.03 + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.03);
      osc.stop(this.ctx.currentTime + idx * 0.03 + 0.15);
    });
  }

  public playGameOver() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [400, 350, 300, 220];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.12 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.12);
      osc.stop(this.ctx.currentTime + idx * 0.12 + 0.25);
    });
  }

  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }
}

export const soundManager = new SoundManager();

