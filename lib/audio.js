'use client';

/* Voice and sound effects are produced by the browser itself — no audio files
   to host, and it keeps the app tiny on a phone. */

let cachedVoice = null;

function bestVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const english = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
  const liked = ['samantha', 'karen', 'moira', 'google uk english female', 'google us english', 'zira'];
  cachedVoice =
    english.find((v) => liked.some((n) => v.name.toLowerCase().includes(n))) ||
    english[0] ||
    voices[0];
  return cachedVoice;
}

export function speechReady() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Say a word or a phoneme out loud, slowly and clearly. */
export function say(text, { rate = 0.75, pitch = 1.1, repeat = 1 } = {}) {
  if (!speechReady() || !text) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  for (let i = 0; i < repeat; i++) {
    const u = new SpeechSynthesisUtterance(text);
    const v = bestVoice();
    if (v) u.voice = v;
    u.lang = v?.lang || 'en-GB';
    u.rate = rate;
    u.pitch = pitch;
    synth.speak(u);
  }
}

/** Stretch a word out sound by sound, then say it whole: c — a — t — cat. */
export function sayBlended(word, letters) {
  if (!speechReady()) return;
  const parts = letters || word.split('');
  parts.forEach((p, i) => setTimeout(() => say(p, { rate: 0.55 }), i * 750));
  setTimeout(() => say(word, { rate: 0.7 }), parts.length * 750 + 250);
}

export function stopSpeaking() {
  if (speechReady()) window.speechSynthesis.cancel();
}

/* ── Sound effects, drawn with an oscillator ─────────────────────────────── */

let ctx = null;
function audioCtx() {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, length, type = 'sine', volume = 0.14) {
  const ac = audioCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + start);
  gain.gain.setValueAtTime(0, ac.currentTime + start);
  gain.gain.linearRampToValueAtTime(volume, ac.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + length);
  osc.connect(gain).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + length + 0.05);
}

export const sfx = {
  tap: () => tone(520, 0, 0.07, 'triangle', 0.08),
  correct: () => {
    tone(660, 0, 0.12, 'sine');
    tone(880, 0.1, 0.18, 'sine');
  },
  wrong: () => {
    tone(220, 0, 0.16, 'sine', 0.1);
    tone(170, 0.12, 0.2, 'sine', 0.1);
  },
  win: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25, 'triangle', 0.12));
  },
  levelUp: () => {
    [440, 554, 659, 880, 1108].forEach((f, i) => tone(f, i * 0.1, 0.3, 'sine', 0.12));
  },
};
