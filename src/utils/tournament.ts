export interface TournamentState {
  weekKey: string; // e.g. "2026-W14"
  score: number;
  bestScore: number;
  isActive: boolean;
}

export function getWeekKey(): string {
  const now = new Date();
  const msk = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
  const startOfYear = new Date(msk.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((msk.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${msk.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export function isTournamentWeek(_weekKey: string): boolean {
  const now = new Date();
  const msk = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
  const day = msk.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  const hour = msk.getHours();

  // Tournament: Fri 18:00 MSK → Thu 23:59 MSK
  if (day === 5 && hour >= 18) return true; // Friday after 18:00
  if (day === 6 || day === 0) return true;  // Saturday, Sunday
  if (day >= 1 && day <= 4) return true;    // Monday-Thursday
  return false;
}

export function getTournamentTimeLeft(): { days: number; hours: number; minutes: number } | null {
  const now = new Date();
  const msk = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
  const day = msk.getDay();
  const hour = msk.getHours();

  // Always return time left during tournament week (Fri 18:00 → Thu 23:59)
  let daysUntilEnd: number;
  let hoursUntilEnd: number;

  if (day === 5 && hour >= 18) {
    // Friday after 18:00 — 6 days + remaining hours
    daysUntilEnd = 6;
    hoursUntilEnd = 23 - hour + (hour === 23 ? 0 : 1);
  } else if (day === 6) {
    // Saturday — 5 days
    daysUntilEnd = 5;
    hoursUntilEnd = 24 - hour;
  } else if (day === 0) {
    // Sunday — 4 days
    daysUntilEnd = 4;
    hoursUntilEnd = 24 - hour;
  } else if (day >= 1 && day <= 3) {
    // Mon-Tue-Wed — 3/2/1 days
    daysUntilEnd = 4 - day;
    hoursUntilEnd = 24 - hour;
  } else if (day === 4) {
    // Thursday — only hours left!
    daysUntilEnd = 0;
    hoursUntilEnd = 23 - hour;
    if (hour >= 23) return null; // Tournament ended
  } else {
    return null; // Not tournament week yet (Fri before 18:00)
  }

  return {
    days: daysUntilEnd,
    hours: Math.max(0, hoursUntilEnd),
    minutes: 0,
  };
}

export function getTournamentMultiplier(): number {
  return isTournamentWeek(getWeekKey()) ? 2 : 1;
}
