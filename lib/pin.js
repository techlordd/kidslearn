'use client';

/* A grown-up PIN is a deterrent, not real security — it just keeps little
   fingers out of settings and the reset button. */
const KEY = 'sound-safari:parentPin';

export function getPin() {
  try {
    return localStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
}

export function setPin(pin) {
  try {
    if (pin) localStorage.setItem(KEY, pin);
    else localStorage.removeItem(KEY);
  } catch {}
}
