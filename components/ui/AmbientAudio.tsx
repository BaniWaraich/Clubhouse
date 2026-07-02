'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/gsap';

/**
 * A discreet, warm ambient bed and its single quiet toggle (spec §3.4).
 *
 * - OFF by default. Never autoplays: sound is only ever produced from a user
 *   gesture (the toggle click, or — when a prior "on" choice is remembered — the
 *   first interaction after load, which the browser's autoplay policy requires
 *   anyway). We never start an AudioContext on mount.
 * - Remembers the choice in localStorage and restores the toggle state.
 * - `prefers-reduced-motion` is treated as a sensible default-off signal: with no
 *   stored choice and reduced-motion set, we stay silent.
 *
 * The bed is SYNTHESISED (no audio asset to ship or fetch): two slightly detuned
 * low oscillators through a soft low-pass, a slow LFO breathing the cutoff, at a
 * very low master gain — a warm candlelit hum, not a track.
 */

const STORAGE_KEY = 'sodalis-ambient';
const MASTER = 0.05; // ceiling — deliberately just-there, never foreground

type Nodes = {
  ctx: AudioContext;
  master: GainNode;
};

export function AmbientAudio() {
  const [on, setOn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const nodesRef = useRef<Nodes | null>(null);
  const armedRef = useRef<(() => void) | null>(null);

  // Build the graph lazily, inside a user gesture, the first time sound is asked
  // for. Returns the shared nodes; safe to call repeatedly.
  const ensureGraph = useCallback((): Nodes => {
    if (nodesRef.current) return nodesRef.current;

    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctor();

    const master = ctx.createGain();
    master.gain.value = 0; // ramped up on enable so it never clicks in
    master.connect(ctx.destination);

    // soft low-pass — keeps the bed dark and warm, no top-end hiss
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 480;
    filter.Q.value = 0.6;
    filter.connect(master);

    // two detuned low voices a fifth apart — a warm, consonant drone
    for (const [freq, detune] of [
      [110, -4],
      [164.81, 5],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = 0.5;
      osc.connect(g).connect(filter);
      osc.start();
    }

    // slow LFO breathing the cutoff so the bed drifts and never sits frozen
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 120;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    nodesRef.current = { ctx, master };
    return nodesRef.current;
  }, []);

  const fade = useCallback((target: number, seconds: number) => {
    const n = nodesRef.current;
    if (!n) return;
    const now = n.ctx.currentTime;
    n.master.gain.cancelScheduledValues(now);
    n.master.gain.setValueAtTime(n.master.gain.value, now);
    n.master.gain.linearRampToValueAtTime(target, now + seconds);
  }, []);

  const enable = useCallback(() => {
    const n = ensureGraph();
    if (n.ctx.state === 'suspended') void n.ctx.resume();
    fade(MASTER, 1.4);
  }, [ensureGraph, fade]);

  const disable = useCallback(() => {
    fade(0, 0.9);
    const n = nodesRef.current;
    if (n) window.setTimeout(() => void n.ctx.suspend(), 950);
  }, [fade]);

  // Restore the remembered choice, but DO NOT make sound on mount. If the choice
  // was "on", arm a one-time gesture listener (autoplay policy requires a gesture
  // anyway) so the bed resumes the first time the visitor touches the page.
  useEffect(() => {
    setMounted(true);
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      /* private mode / blocked storage — fall through to default-off */
    }
    if (stored === 'on') {
      setOn(true);
      const start = () => {
        enable();
        teardown();
      };
      const teardown = () => {
        window.removeEventListener('pointerdown', start);
        window.removeEventListener('keydown', start);
        armedRef.current = null;
      };
      window.addEventListener('pointerdown', start, { once: true });
      window.addEventListener('keydown', start, { once: true });
      armedRef.current = teardown;
    }
    // stored === 'off' or null → stay silent (reduced-motion is also default-off)
    return () => {
      armedRef.current?.();
      const n = nodesRef.current;
      if (n) void n.ctx.close();
    };
  }, [enable]);

  const toggle = useCallback(() => {
    setOn((prev) => {
      const next = !prev;
      // a real gesture is happening now — disarm any pending auto-resume
      armedRef.current?.();
      if (next) enable();
      else disable();
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [enable, disable]);

  // Render nothing until mounted so SSR markup and the restored state agree.
  if (!mounted) return null;

  // reduced-motion default-off is handled above (we never auto-enable); the
  // control itself stays available so a visitor can still choose sound.
  void prefersReducedMotion;

  return (
    <button
      type="button"
      className="ambient-toggle"
      data-on={on}
      aria-pressed={on}
      aria-label={on ? 'Turn ambient sound off' : 'Turn ambient sound on'}
      onClick={toggle}
    >
      <span className="ambient-toggle__bars" aria-hidden>
        <span />
        <span />
        <span />
      </span>
      <span className="ambient-toggle__label">Sound</span>
    </button>
  );
}
