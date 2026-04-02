export interface TournamentState {
  weekKey: string; // e.g. "2026-W14"
  score: number;
  bestScore: number;
  isActive: boolean;
}

function getWeekNumber(msk: Date): number {
  const startOfYear = new Date(msk.getFullYear(), 0, 1);
  return Math.ceil(((msk.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
}

export function getWeekKey(): string {
  const now = new Date();
  const msk = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
  return `${msk.getFullYear()}-W${String(getWeekNumber(msk)).padStart(2, '0')}`;
}

export function isTournamentWeek(_weekKey: string): boolean {
  const now = new Date();
  const msk = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
  const day = msk.getDay(); // 0=Sun, 5=Fri, 6=Sat
  const hour = msk.getHours();
  
  // Tournament: Fri 18:00 MSK → Thu 23:59 MSK
  if (day === 5 && hour >= 18) return true;
  if (day === 6 || day === 0) return true;
  if (day >= 1 && day <= 4) return true;
  return false;
}

export function getTournamentTimeLeft(): { days: number; hours: number; minutes: number } | null {
  const now = new Date();
  const msk = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
  const day = msk.getDay();
  const hour = msk.getHours();
  
  if (day === 5 && hour >= 18) {
    // Friday 18:00 - next Thursday 23:59
    const thursday = new Date(msk);
    thursday.setDate(thursday.getDate() + (4 - ((day - 5 + 7) % 7)) % 7 + (day === 5 ? 0 : 7));
    if (day === 5) thursday.setDate(thursday.getDate() + 6);
    thursday.setHours(23, 59, 59);
    const diff = thursday.getTime() - msk.getTime();
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
    };
  }
  return null;
}

export function getTournamentMultiplier(): number {
  return isTournamentWeek(getWeekKey()) ? 2 : 1;
}
