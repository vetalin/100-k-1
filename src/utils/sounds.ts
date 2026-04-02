// Web Audio API sound synthesizer — no external files needed

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', gain: number = 0.3): void {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(gain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    // Ignore audio errors (e.g., autoplay blocked)
  }
}

// Musical notes (Hz)
const NOTE = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
  G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25,
};

export type SoundName = 'correct' | 'wrong' | 'select' | 'reveal' | 'round_end' | 'game_end' | 'achievement';

export function playSound(name: SoundName): void {
  switch (name) {
    case 'correct':
      // Pleasant ding — E5 → G5
      playTone(NOTE.E5, 0.1, 'sine', 0.3);
      setTimeout(() => playTone(NOTE.G4, 0.15, 'sine', 0.25), 80);
      break;
    
    case 'wrong':
      // Low buzz
      playTone(150, 0.3, 'sawtooth', 0.15);
      break;
    
    case 'select':
      // Click
      playTone(800, 0.03, 'square', 0.1);
      break;
    
    case 'reveal':
      // Whoosh
      playTone(400, 0.15, 'sine', 0.15);
      setTimeout(() => playTone(600, 0.1, 'sine', 0.1), 50);
      break;
    
    case 'round_end':
      // Two-note fanfare
      playTone(NOTE.C5, 0.12, 'triangle', 0.25);
      setTimeout(() => playTone(NOTE.E5, 0.2, 'triangle', 0.25), 120);
      break;
    
    case 'game_end':
      // Three-note fanfare
      playTone(NOTE.C4, 0.15, 'triangle', 0.25);
      setTimeout(() => playTone(NOTE.E4, 0.15, 'triangle', 0.25), 150);
      setTimeout(() => playTone(NOTE.G4, 0.3, 'triangle', 0.3), 300);
      break;
    
    case 'achievement':
      // Victory melody — C E G C
      const melody = [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.C5];
      melody.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.15, 'triangle', 0.3), i * 120);
      });
      break;
  }
}

export function playSoundIfEnabled(name: SoundName, enabled: boolean): void {
  if (enabled) playSound(name);
}
