import { PlayerProfile, Role, Tier, CalculationResult, CompetitionType } from '../types';

export const PREDEFINED_COMPETITIONS = [
  { id: 'c1', name: 'LAFF', type: CompetitionType.ONLINE, tier: Tier.B },
  { id: 'c2', name: 'COPA FF', type: CompetitionType.ONLINE, tier: Tier.A },
  { id: 'c3', name: 'FFWS BR', type: CompetitionType.PRESENCIAL, tier: Tier.A },
  { id: 'c4', name: 'EWC', type: CompetitionType.PRESENCIAL, tier: Tier.S },
  { id: 'c5', name: 'FFWS WORLD', type: CompetitionType.PRESENCIAL, tier: Tier.S },
];

export function calculateScore(profile: PlayerProfile): CalculationResult {
  let score = 0;
  
  // 1. Role & Captain (Max ~20 points)
  let roleScore = 0;
  switch (profile.role) {
    case Role.RUSH1: roleScore = 12; break;
    case Role.RUSH2: roleScore = 11; break;
    case Role.FLEX: roleScore = 10; break;
    case Role.SNIPER: roleScore = 9; break;
    case Role.GRANDEIRO: roleScore = 9; break;
    default: roleScore = 5;
  }
  
  if (profile.isCaptain) {
    roleScore += 5; // Leadership bonus
  }
  
  // 2. Stats (Max ~20 points)
  // Heuristic: 1000 kills is "excellent"
  let statsScore = Math.min(15, (profile.officialKills / 1000) * 15);
  
  if (profile.isCaptain) {
    // Heuristic: 10 booyahs in last comp is "excellent"
    const booyahScore = Math.min(5, (profile.lastBooyahs / 10) * 5);
    statsScore += booyahScore;
  } else {
    // Redistribute weight if not captain
    statsScore = Math.min(20, (profile.officialKills / 800) * 20);
  }

  // 3. Social (Max ~15 points)
  // Logarithmic scale for followers
  let socialScore = 0;
  if (profile.followers > 0) {
    const logFollowers = Math.log10(profile.followers);
    // Assume 1M followers = max points (log10(1000000) = 6)
    // Assume 1k followers = min entry (log10(1000) = 3)
    socialScore += Math.max(0, Math.min(10, (logFollowers - 2) * 2.5));
  }
  // Engagement bonus
  socialScore += Math.min(5, (profile.engagement / 10) * 5);

  // 4. Competitions & Titles (Max ~30 points)
  let competitionScore = 0;
  
  // Base value for playing in tiers
  profile.selectedCompetitions.forEach(comp => {
    let val = 0;
    if (comp.tier === Tier.S) val = 4;
    else if (comp.tier === Tier.A) val = 3;
    else if (comp.tier === Tier.B) val = 2;
    else val = 1;

    if (comp.type === CompetitionType.PRESENCIAL) val *= 1.5;
    competitionScore += val;
  });

  // Titles
  profile.titles.forEach(t => {
     // Simplifying: 3 points per title
     competitionScore += (t.count * 3);
  });

  // Cap competition score
  competitionScore = Math.min(30, competitionScore);

  // 5. History / Participations / Last 3 (Max ~15 points)
  let historyScore = 0;
  
  profile.participations.forEach(p => {
    historyScore += (p.count * 0.5);
  });

  profile.recentCompetitions.forEach(rc => {
    // Lower position is better
    let perf = 0;
    if (rc.position === 1) perf = 5;
    else if (rc.position <= 3) perf = 3;
    else if (rc.position <= 10) perf = 1;
    
    // Bonus for offline/presencial
    if (rc.type === CompetitionType.PRESENCIAL) perf *= 1.2;
    historyScore += perf;
  });

  historyScore = Math.min(15, historyScore);

  // Total
  score = roleScore + statsScore + socialScore + competitionScore + historyScore;
  score = Math.min(100, Math.round(score));

  // Determine Tier and Salary
  let tier = '';
  let salaryRange = '';

  if (score >= 80) {
    tier = 'TIER S';
    salaryRange = 'R$ 8.000 - R$ 20.000';
  } else if (score >= 60) {
    tier = 'TIER A';
    salaryRange = 'R$ 5.000 - R$ 7.999';
  } else if (score >= 40) {
    tier = 'TIER B';
    salaryRange = 'R$ 3.000 - R$ 4.999';
  } else if (score >= 20) {
    tier = 'TIER C';
    salaryRange = 'R$ 1.500 - R$ 2.999';
  } else {
    tier = 'TIER D';
    salaryRange = 'Até R$ 1.499';
  }

  return {
    score,
    tier,
    salaryRange,
    breakdown: {
      roleScore,
      statsScore,
      socialScore,
      competitionScore,
      historyScore
    }
  };
}