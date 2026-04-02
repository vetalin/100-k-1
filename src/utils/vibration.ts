// Vibration API wrapper — mobile only

export type VibrationPattern = 'correct' | 'wrong' | 'light' | 'medium' | 'heavy';

const patterns: Record<VibrationPattern, number | number[]> = {
  correct: 30,
  wrong: [50, 30, 50],
  light: 10,
  medium: 30,
  heavy: 100,
};

export function vibrate(pattern: VibrationPattern): void {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(patterns[pattern]);
    }
  } catch (e) {
    // Ignore vibration errors
  }
}

export function vibrateIfEnabled(pattern: VibrationPattern, enabled: boolean): void {
  if (enabled) vibrate(pattern);
}

export function isVibrationSupported(): boolean {
  return 'vibrate' in navigator;
}
