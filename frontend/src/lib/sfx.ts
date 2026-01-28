type SfxType = "nav" | "button" | "card";

type SfxSpec = {
  frequency: number;
  duration: number;
  gain: number;
};

const SFX_MAP: Record<SfxType, SfxSpec> = {
  nav: { frequency: 880, duration: 0.06, gain: 0.05 },
  button: { frequency: 720, duration: 0.055, gain: 0.045 },
  card: { frequency: 620, duration: 0.07, gain: 0.04 },
};

let audioContext: AudioContext | null = null;
let lastPlayedAt = 0;
const MIN_GAP_MS = 35;

const getAudioContext = () => {
  if (audioContext) return audioContext;
  const AudioContextConstructor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextConstructor) return null;
  audioContext = new AudioContextConstructor();
  return audioContext;
};

export const playSfx = (type: SfxType) => {
  const now = performance.now();
  if (now - lastPlayedAt < MIN_GAP_MS) return;
  lastPlayedAt = now;

  const context = getAudioContext();
  if (!context) return;

  if (context.state === "suspended") {
    void context.resume().catch(() => {});
  }

  const { frequency, duration, gain } = SFX_MAP[type];
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, context.currentTime);

  const startTime = context.currentTime;
  const endTime = startTime + duration;
  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(gain, startTime + 0.006);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

  oscillator.connect(gainNode).connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(endTime + 0.02);
};
