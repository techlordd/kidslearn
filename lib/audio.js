'use client';

/* Voice and sound effects are produced by the browser itself — no audio files
   to host, and it keeps the app tiny on a phone. */

let cachedVoice = null;

function pickVoice(voices) {
  const english = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
  const liked = ['samantha', 'karen', 'moira', 'google uk english female', 'google us english', 'zira'];
  return (
    english.find((v) => liked.some((n) => v.name.toLowerCase().includes(n))) ||
    english[0] ||
    voices[0] ||
    null
  );
}

function bestVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length) cachedVoice = pickVoice(voices);
  return cachedVoice;
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  /* Chrome (and others) load the voice list asynchronously — the first call
     to getVoices() often comes back empty, which used to lock the app into
     a low-quality fallback voice for the whole session. Re-pick once the
     real list lands. */
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    cachedVoice = null;
    bestVoice();
  });
}

export function speechReady() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/* Chrome silently pauses any utterance running past ~15s, and can drop a
   speak() called in the same tick as cancel() — both read as "the sound
   hangs". A gentle pause/resume nudge and a one-tick gap work around them. */
let keepAliveTimer = null;
function stopKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}
function startKeepAlive(synth) {
  stopKeepAlive();
  keepAliveTimer = setInterval(() => {
    if (synth.speaking) {
      synth.pause();
      synth.resume();
    } else {
      stopKeepAlive();
    }
  }, 4000);
}

function speakOne(text, { rate = 0.75, pitch = 1.1 } = {}) {
  if (!speechReady() || !text) return null;
  const synth = window.speechSynthesis;
  const u = new SpeechSynthesisUtterance(text);
  const v = bestVoice();
  if (v) u.voice = v;
  u.lang = v?.lang || 'en-GB';
  u.rate = rate;
  u.pitch = pitch;
  u.onend = stopKeepAlive;
  u.onerror = stopKeepAlive;
  synth.speak(u);
  startKeepAlive(synth);
  return u;
}

/** Say a word or a phoneme out loud, slowly and clearly. Cuts off anything
    already playing, so a fresh tap always answers straight away. */
export function say(text, { rate = 0.75, pitch = 1.1, repeat = 1 } = {}) {
  if (!speechReady() || !text) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  stopKeepAlive();
  // cancel() needs a tick to actually clear the queue on some browsers;
  // speaking again in the same tick can be silently dropped.
  setTimeout(() => {
    for (let i = 0; i < repeat; i++) speakOne(text, { rate, pitch });
  }, 0);
}

/** Stretch a word out sound by sound, then say it whole: c — a — t — cat.
    Each sound waits for the last to actually finish (instead of a fixed
    750ms guess), so short sounds move on quickly and nothing overlaps or
    cuts the previous one off mid-word. */
export function sayBlended(word, letters) {
  if (!speechReady()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  stopKeepAlive();
  const parts = letters || word.split('');

  const speakNext = (i) => {
    if (i >= parts.length) {
      setTimeout(() => speakOne(word, { rate: 0.7 }), 150);
      return;
    }
    const u = speakOne(parts[i], { rate: 0.55 });
    if (!u) return;
    const advance = () => speakNext(i + 1);
    u.onend = advance;
    u.onerror = advance;
  };

  setTimeout(() => speakNext(0), 0);
}

export function stopSpeaking() {
  stopKeepAlive();
  if (speechReady()) window.speechSynthesis.cancel();
}

/* ── Sound effects, drawn with an oscillator ─────────────────────────────── */

let ctx = null;
function audioCtx() {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

function tone(freq, start, length, type = 'sine', volume = 0.14) {
  const ac = audioCtx();
  if (!ac) return;

  const schedule = () => {
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
  };

  /* Scheduling against ac.currentTime while the context is still suspended
     bakes in a clock that hasn't started yet — once resume() actually lands,
     those times are already in the past and the volume ramp gets skipped,
     which is heard as a click or crack instead of a clean tone. Waiting for
     resume() to truly finish keeps every scheduled time honest. */
  if (ac.state === 'running') schedule();
  else ac.resume().then(schedule).catch(schedule);
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

/** Wake the audio engines up during the very first tap anywhere in the app,
    instead of on the first real sound — iOS Safari in particular can leave
    the first genuine speech/tone silent or delayed if nothing has touched
    the audio APIs yet inside a user gesture. */
export function primeAudio() {
  const ac = audioCtx();
  if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
  if (speechReady()) bestVoice();
}
