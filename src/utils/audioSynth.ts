// Romantic Audio Manager with real acoustic/piano romantic masterpieces & procedural ambient fallback

export interface RomanticTrack {
  id: string;
  title: string;
  composer: string;
  description: string;
  url: string;
  isProcedural?: boolean;
}

export const ROMANTIC_TRACKS: RomanticTrack[] = [
  {
    id: 'misswilsonsays_until_i_found_you',
    title: 'until I found you',
    composer: 'misswilsonsays',
    description: 'Versão acústica romântica marcante e emocionante',
    url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/19/07/39/190739a3-dca2-b7ca-151f-b2261bcdb37a/mzaf_17168579763952181308.plus.aac.ep.m4a',
  },
];

class RomanticAudioPlayer {
  private audioElement: HTMLAudioElement | null = null;
  private currentTrackId = 'misswilsonsays_until_i_found_you';
  private isPlaying = false;
  private volume = 0.10;
  private listeners: Set<() => void> = new Set();

  // Procedural Web Audio fallback
  private ctx: AudioContext | null = null;
  private timer: number | null = null;
  private noteIndex = 0;
  private masterGain: GainNode | null = null;

  private chords = [
    { base: 293.66, notes: [293.66, 369.99, 440.00, 587.33] },
    { base: 220.00, notes: [220.00, 277.18, 329.63, 440.00] },
    { base: 246.94, notes: [246.94, 293.66, 369.99, 493.88] },
    { base: 185.00, notes: [185.00, 220.00, 277.18, 369.99] },
    { base: 196.00, notes: [196.00, 246.94, 293.66, 392.00] },
    { base: 293.66, notes: [293.66, 369.99, 440.00, 587.33] },
  ];

  private melodyNotes = [
    587.33, 659.25, 739.99, 880.00, 739.99, 659.25,
    587.33, 493.88, 440.00, 493.88, 587.33, 739.99,
  ];

  constructor() {
    this.currentTrackId = 'misswilsonsays_until_i_found_you';
    this.volume = 0.10;
    try {
      localStorage.setItem('romantic_selected_track_id', 'misswilsonsays_until_i_found_you');
      localStorage.setItem('romantic_music_volume', '0.10');
    } catch (e) {
      console.warn('Audio storage read error:', e);
    }
  }

  private notify() {
    this.listeners.forEach(fn => {
      try { fn(); } catch (e) { console.error(e); }
    });
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  public getTracks(): RomanticTrack[] {
    return ROMANTIC_TRACKS;
  }

  public getCurrentTrack(): RomanticTrack {
    if (this.currentTrackId.startsWith('custom:')) {
      const customUrl = this.currentTrackId.replace('custom:', '');
      return {
        id: this.currentTrackId,
        title: 'Música Especial do Casal',
        composer: 'Personalizada',
        description: 'Faixa personalizada configurada por link direto',
        url: customUrl,
      };
    }
    const found = ROMANTIC_TRACKS.find(t => t.id === this.currentTrackId);
    return found || ROMANTIC_TRACKS[0];
  }

  public setTrack(trackId: string, customUrl?: string) {
    const wasPlaying = this.isPlaying;
    this.pause();

    if (trackId === 'custom' && customUrl) {
      this.currentTrackId = `custom:${customUrl.trim()}`;
    } else {
      this.currentTrackId = trackId;
    }

    try {
      localStorage.setItem('romantic_selected_track_id', this.currentTrackId);
    } catch (e) {
      console.warn(e);
    }

    if (wasPlaying) {
      this.play();
    } else {
      this.notify();
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume * 0.7, this.ctx.currentTime);
    }
    try {
      localStorage.setItem('romantic_music_volume', this.volume.toString());
    } catch (e) {
      console.warn(e);
    }
    this.notify();
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private initAudioElement(url: string) {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement.remove();
      this.audioElement = null;
    }

    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.src = url;
    audio.loop = true;
    audio.volume = this.volume;

    audio.addEventListener('error', (err) => {
      console.warn('HTML5 Audio playback error, falling back to ambient synth:', err);
      if (this.isPlaying) {
        this.stopProcedural();
        this.startProcedural();
      }
    });

    audio.addEventListener('ended', () => {
      if (this.isPlaying) {
        audio.play().catch(() => {});
      }
    });

    this.audioElement = audio;
  }

  // Procedural Web Audio Synth fallback
  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume * 0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playPluck(freq: number, time: number, duration: number = 2.5, isMelody: boolean = false) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = isMelody ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isMelody ? 1800 : 900, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(isMelody ? 0.25 : 0.16, time + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private startProcedural() {
    this.initContext();
    if (!this.ctx) return;

    const step = () => {
      if (!this.isPlaying || !this.ctx) return;
      const chordIdx = Math.floor(this.noteIndex / 4) % this.chords.length;
      const chord = this.chords[chordIdx];
      const arpeggioNote = chord.notes[this.noteIndex % chord.notes.length];
      const now = this.ctx.currentTime;

      if (this.noteIndex % 4 === 0) {
        this.playPluck(chord.base / 2, now, 3.8, false);
      }
      this.playPluck(arpeggioNote, now, 2.0, false);
      if (this.noteIndex % 2 === 0) {
        const melodyIdx = (this.noteIndex / 2) % this.melodyNotes.length;
        const melodyFreq = this.melodyNotes[melodyIdx];
        this.playPluck(melodyFreq, now + 0.1, 2.5, true);
      }

      this.noteIndex++;
      this.timer = window.setTimeout(step, 650);
    };

    step();
  }

  private stopProcedural() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  public play() {
    const track = this.getCurrentTrack();
    this.isPlaying = true;

    if (track.isProcedural || !track.url) {
      if (this.audioElement) {
        this.audioElement.pause();
      }
      this.stopProcedural();
      this.startProcedural();
      this.notify();
      return;
    }

    // Try HTML5 Audio
    this.stopProcedural();
    try {
      if (!this.audioElement || this.audioElement.src !== track.url) {
        this.initAudioElement(track.url);
      }
      if (this.audioElement) {
        this.audioElement.volume = this.volume;
        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('AutoPlay blocked or failed, using synth fallback:', err);
            this.startProcedural();
          });
        }
      }
    } catch (err) {
      console.warn('Audio playback exception:', err);
      this.startProcedural();
    }

    this.notify();
  }

  public pause() {
    this.isPlaying = false;
    if (this.audioElement) {
      try {
        this.audioElement.pause();
      } catch (e) {
        console.warn(e);
      }
    }
    this.stopProcedural();
    this.notify();
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      this.play();
      return true;
    }
  }
}

export const romanticAudio = new RomanticAudioPlayer();
