export interface ChallengeParams {
  category: string;
  seed: number;
  round: number;
  score: number;
  fromId: number;
  fromName: string;
}

const APP_ID = 0; // будет заменено на реальный ID

export function buildChallengeLink(params: ChallengeParams): string {
  const p = new URLSearchParams({
    ref: 'challenge',
    cat: params.category,
    seed: String(params.seed),
    round: String(params.round),
    score: String(params.score),
    from: String(params.fromId),
    fname: encodeURIComponent(params.fromName),
  });
  return `https://vk.com/app${APP_ID}#${p.toString()}`;
}

export function parseChallengeFromHash(hash: string): ChallengeParams | null {
  try {
    const p = new URLSearchParams(hash.replace(/^#/, ''));
    if (p.get('ref') !== 'challenge') return null;
    return {
      category: p.get('cat') ?? 'all',
      seed: parseInt(p.get('seed') ?? '0', 10),
      round: parseInt(p.get('round') ?? '1', 10),
      score: parseInt(p.get('score') ?? '0', 10),
      fromId: parseInt(p.get('from') ?? '0', 10),
      fromName: decodeURIComponent(p.get('fname') ?? 'Друг'),
    };
  } catch {
    return null;
  }
}

export function parseChallengeFromSearch(): ChallengeParams | null {
  // VK passes params both in hash and search
  const hash = window.location.hash;
  const search = window.location.search;
  return parseChallengeFromHash(hash) ?? parseChallengeFromHash(search);
}
