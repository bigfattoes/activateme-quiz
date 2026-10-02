#!/usr/bin/env python3
"""
Original 15-second music bed for the ActivateMe Fest quiz Reel.

Composed in code so it is 100% original (no samples, no library tracks) and
every hit lands exactly on the picture's 120 BPM grid (one beat = 0.5 s):

  0.0 – 3.0   Frame 1  sport words on 0 / 1 / 2 s -> big hits, light groove
  3.0 – 6.0   Frame 2  four-on-the-floor; 16th-note arp flicker 4.0–5.0; impact at 5.0 (grid)
  6.0 – 9.0   Frame 3  the breather: drums drop, pad + soft plucks, riser into 9.0
  9.0 – 12.5  Frame 4  full groove; tap at 10.0, slide whoosh at 10.5, result hit 11.0, sparkle 11.25
  12.5 – 15.0 Frame 5  end-card impact + final chord, groove thins, rings out

Run:  python3 scripts/compose_music.py   ->  assets/audio/music.wav
Needs numpy + scipy.
"""
import os
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR = 48000
BPM = 120
BEAT = 60 / BPM
LENGTH = 15.0
TAIL = 0.0
N = int(SR * (LENGTH + TAIL))
rng = np.random.default_rng(16012027)  # fixed seed: same track every run

L = np.zeros(N)
R = np.zeros(N)
VERB = np.zeros(N)  # reverb send (mono)


def t_axis(dur):
    return np.arange(int(SR * dur)) / SR


def add(sig, at, gain=1.0, pan=0.0, verb=0.0):
    i = int(round(at * SR))
    if i >= N:
        return
    sig = sig[: N - i]
    lg = gain * np.cos((pan + 1) * np.pi / 4)
    rg = gain * np.sin((pan + 1) * np.pi / 4)
    L[i : i + len(sig)] += sig * lg
    R[i : i + len(sig)] += sig * rg
    if verb:
        VERB[i : i + len(sig)] += sig * gain * verb


def lp(sig, cutoff, order=2):
    return sosfilt(butter(order, min(cutoff, SR * 0.45), "low", fs=SR, output="sos"), sig)


def hp(sig, cutoff, order=2):
    return sosfilt(butter(order, cutoff, "high", fs=SR, output="sos"), sig)


def bp(sig, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), sig)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def saw(freq, dur, detune_cents=0.0):
    t = t_axis(dur)
    f = freq * 2 ** (detune_cents / 1200)
    ph = (t * f) % 1.0
    return 2 * ph - 1


# ---------- instruments ----------

def kick(strength=1.0):
    t = t_axis(0.45)
    f = 45 + 110 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 7.5)
    click = lp(rng.standard_normal(len(t)), 4000) * np.exp(-t * 300) * 0.25
    return np.tanh((body + click) * 1.6 * strength)


def clap():
    t = t_axis(0.35)
    noise = bp(rng.standard_normal(len(t)), 900, 5200)
    env = np.zeros(len(t))
    for k, off in enumerate([0.0, 0.011, 0.022]):
        i = int(off * SR)
        env[i:] += np.exp(-(t[: len(t) - i]) * (90 if k < 2 else 16))
    return noise * env * 0.55


def hat(open_=False):
    dur = 0.22 if open_ else 0.05
    t = t_axis(dur)
    n = hp(rng.standard_normal(len(t)), 7500)
    return n * np.exp(-t * (14 if open_ else 80)) * 0.28


def bass_note(note, dur):
    f = midi(note)
    t = t_axis(dur)
    s = 0.6 * saw(f, dur) + 0.6 * np.sin(2 * np.pi * f * t)
    env = np.minimum(1, t / 0.005) * np.exp(-t * 3.2)
    return lp(s, 420) * env * 0.9


def pad_chord(notes, dur, bright=1600):
    t = t_axis(dur)
    s = np.zeros(len(t))
    for n in notes:
        for d in (-9, 0, 8):
            s += saw(midi(n), dur, d)
    s = lp(s / (len(notes) * 3), bright, 2)
    env = np.minimum(1, t / 0.25) * np.minimum(1, (dur - t) / 0.3)
    return s * np.clip(env, 0, 1) * 0.5


def stab(notes, dur=0.4, bright=3200):
    t = t_axis(dur)
    s = np.zeros(len(t))
    for n in notes:
        for d in (-6, 6):
            s += saw(midi(n), dur, d)
    s = lp(s / (len(notes) * 2), bright)
    return s * np.exp(-t * 7) * np.minimum(1, t / 0.003) * 0.6


def pluck(note, dur=0.3, bright=5000):
    t = t_axis(dur)
    f = midi(note)
    s = 0.7 * saw(f, dur) + 0.5 * np.sin(2 * np.pi * 2 * f * t)
    return lp(s, bright) * np.exp(-t * 12) * np.minimum(1, t / 0.002) * 0.45


def impact(size=1.0):
    t = t_axis(1.6)
    f = 30 + 70 * np.exp(-t * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6)
    noise = lp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 6) * 0.35
    return np.tanh((boom + noise) * 1.4) * size


def riser(dur):
    t = t_axis(dur)
    n = rng.standard_normal(len(t))
    # sweep a band-pass upwards by crossfading octave bands
    out = np.zeros(len(t))
    bands = [(300, 900), (700, 2000), (1600, 4500), (3500, 9000)]
    for k, (lo, hi) in enumerate(bands):
        w = np.clip(1 - np.abs(t / dur * (len(bands) - 1) - k), 0, 1)
        out += bp(n, lo, hi) * w
    return out * (t / dur) ** 2 * 0.35


def whoosh(dur=0.35):
    t = t_axis(dur)
    n = bp(rng.standard_normal(len(t)), 800, 6000)
    env = np.sin(np.pi * t / dur) ** 2
    return n * env * 0.35


def tap():
    t = t_axis(0.08)
    return (np.sin(2 * np.pi * 1800 * t) * 0.6 + hp(rng.standard_normal(len(t)), 3000) * 0.3) * np.exp(-t * 90) * 0.5


def sparkle(start_note=84):
    out = []
    for k, n in enumerate([0, 4, 7, 12, 16]):
        out.append((k * 0.05, pluck(start_note + n, 0.35, 9000) * 0.6))
    return out


# ---------- harmony (C major; chords change with the picture) ----------
C, G, AM, F = [60, 64, 67], [59, 62, 67], [57, 60, 64], [57, 60, 65]
Cadd9 = [60, 64, 67, 74]
CHORDS = [(0.0, 2.0, C, 36), (2.0, 4.0, G, 31), (4.0, 6.0, AM, 33), (6.0, 8.0, F, 29),
          (8.0, 9.0, G, 31), (9.0, 11.0, C, 36), (11.0, 12.5, F, 29), (12.5, 15.0, Cadd9, 36)]


def chord_at(time):
    for a, b, notes, root in CHORDS:
        if a <= time < b:
            return notes, root
    return CHORDS[-1][2], CHORDS[-1][3]


# Pads under everything (quieter in the drop, brighter in the end card)
for a, b, notes, root in CHORDS:
    bright = 900 if 6.0 <= a < 9.0 else (2600 if a >= 12.5 else 1600)
    add(pad_chord(notes, b - a + 0.25, bright), a, gain=0.55, verb=0.5)

# ---------- Frame 1 (0–3): three big word hits + light groove ----------
for at in (0.0, 1.0, 2.0):
    notes, root = chord_at(at)
    add(kick(1.1), at, 0.9)
    add(stab([n + 12 for n in notes]), at, 0.55, verb=0.35)
    add(bass_note(root, 0.9), at, 0.7)
for k in range(12):  # 8th hats from beat 2
    at = 0.25 + k * 0.25
    if at < 3.0 and k % 2 == 1:
        add(hat(), at, 0.8, pan=0.3)
add(kick(0.8), 1.5, 0.6)
add(kick(0.8), 2.5, 0.6)
add(clap(), 1.5, 0.5, verb=0.3)
add(clap(), 2.5, 0.5, verb=0.3)

# ---------- Frame 2 (3–6): four-on-the-floor, flicker arp, grid impact ----------
for k in range(6):
    at = 3.0 + k * BEAT
    if at >= 6.0:
        break
    add(kick(), at, 0.95)
    if k % 2 == 1:
        add(clap(), at, 0.6, verb=0.3)
for k in range(24):  # 16th hats
    at = 3.0 + k * 0.125
    add(hat(open_=(k % 4 == 2)), at, 0.55 if k % 2 else 0.8, pan=0.25)
for k in range(12):  # 8th bass
    at = 3.0 + k * 0.25
    notes, root = chord_at(at)
    add(bass_note(root + (12 if k % 2 else 0), 0.24), at, 0.75)
add(stab([n + 12 for n in chord_at(3.0)[0]]), 3.0, 0.5, verb=0.3)
add(stab([n + 12 for n in chord_at(3.5)[0]]), 3.5, 0.5, verb=0.3)
# flicker 4.0–5.0: rising 16th arp, one note per Acti swap
arp = [69, 72, 76, 79, 81, 84, 88, 91]
for k, n in enumerate(arp):
    add(pluck(n, 0.25), 4.0 + k * 0.125, 0.55, pan=(-0.4 if k % 2 else 0.4), verb=0.25)
add(riser(1.0), 4.0, 0.6)
# 5.0: the grid lands
add(impact(0.9), 5.0, 0.8, verb=0.4)
add(stab([69, 72, 76, 81]), 5.0, 0.7, verb=0.5)

# ---------- Frame 3 (6–9): breather, soft plucks, riser into the phone ----------
add(impact(0.5), 6.0, 0.35, verb=0.6)
breath = [(6.0, 77), (6.5, 72), (7.0, 69), (7.5, 72), (8.0, 74), (8.5, 79)]
for at, n in breath:
    add(pluck(n, 0.5, 2600), at, 0.45, pan=0.2, verb=0.6)
add(bass_note(29, 1.9), 6.0, 0.45)
add(riser(1.0), 8.0, 0.7)
for k in range(8):  # snare-roll build
    at = 8.5 + k * 0.0625
    add(clap(), at, 0.15 + 0.05 * k)

# ---------- Frame 4 (9–12.5): full groove + UI sounds ----------
for k in range(7):
    at = 9.0 + k * BEAT
    add(kick(), at, 0.95)
    if k % 2 == 1:
        add(clap(), at, 0.6, verb=0.3)
for k in range(28):
    at = 9.0 + k * 0.125
    add(hat(open_=(k % 4 == 2)), at, 0.5 if k % 2 else 0.75, pan=-0.25)
for k in range(14):
    at = 9.0 + k * 0.25
    notes, root = chord_at(at)
    add(bass_note(root + (12 if k % 2 else 0), 0.24), at, 0.75)
add(impact(0.6), 9.0, 0.5, verb=0.4)
add(tap(), 10.0, 0.9)                      # finger tap on the answer card
add(whoosh(0.32), 10.45, 0.8, pan=0.3)     # slide to question 6
add(stab([72, 76, 79, 84]), 11.0, 0.65, verb=0.4)  # the result lands
for off, s in sparkle():                    # GOAL! sticker pops
    add(s, 11.25 + off, 0.55, pan=0.2, verb=0.5)

# ---------- Frame 5 (12.5–15): end card ----------
add(impact(1.0), 12.5, 0.85, verb=0.5)
add(stab([n + 12 for n in Cadd9], 0.9), 12.5, 0.7, verb=0.6)
add(bass_note(36, 1.4), 12.5, 0.8)
for k in range(4):
    at = 13.0 + k * BEAT
    add(kick(0.8), at, 0.7)
    if k % 2 == 1:
        add(clap(), at, 0.45, verb=0.35)
for k in range(12):
    at = 13.0 + k * 0.125
    add(hat(), at, 0.45, pan=0.25)
for k, n in enumerate([72, 76, 79, 84, 79, 76]):  # CTA motif under the text reveal
    add(pluck(n, 0.35, 4500), 12.75 + k * 0.125, 0.4, verb=0.5)
add(stab([n + 12 for n in Cadd9], 1.0), 14.5, 0.55, verb=0.7)  # final button
add(kick(1.0), 14.5, 0.8)

# ---------- reverb (convolution with a decaying noise tail) ----------
ir_t = t_axis(1.8)
ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3.2)
ir = lp(ir, 6000)
ir /= np.sqrt(np.sum(ir ** 2))
wet = fftconvolve(VERB, ir)[:N] * 0.35
L += wet
R += np.roll(wet, int(0.011 * SR))

# ---------- master ----------
mix = np.stack([L, R], axis=1)
mix = hp(mix.T, 28).T
fade_out = np.ones(N)
fo = int(0.45 * SR)
fade_out[-fo:] = np.linspace(1, 0, fo) ** 1.5
mix *= fade_out[:, None]
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
mix /= np.max(np.abs(mix)) / 0.76  # peak ~ -2.4 dBFS, about -14 LUFS (Instagram level)

os.makedirs("assets/audio", exist_ok=True)
wavfile.write("assets/audio/music.wav", SR, (mix * 32767).astype(np.int16))
print(f"wrote assets/audio/music.wav — {LENGTH:.1f}s, {SR} Hz stereo, about -14 LUFS")
