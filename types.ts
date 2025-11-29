export enum Role {
  RUSH1 = 'RUSH 1',
  RUSH2 = 'RUSH 2',
  GRANDEIRO = 'GRANDEIRO',
  SNIPER = 'SNIPER',
  FLEX = 'FLEX'
}

export enum Tier {
  S = 'S',
  A = 'A',
  B = 'B',
  C = 'C'
}

export enum CompetitionType {
  ONLINE = 'ONLINE',
  PRESENCIAL = 'PRESENCIAL'
}

export interface Competition {
  id: string;
  name: string;
  type: CompetitionType;
  tier: Tier;
}

export interface DynamicEntry {
  id: string;
  name: string;
  count: number;
}

export interface RecentCompetition {
  id: string;
  name: string;
  type: CompetitionType;
  position: number;
}

export interface PlayerProfile {
  name: string;
  role: Role;
  isCaptain: boolean;
  officialKills: number;
  lastBooyahs: number; // Only if captain
  followers: number;
  engagement: number;
  selectedCompetitions: Competition[]; // List of competitions played
  titles: DynamicEntry[];
  participations: DynamicEntry[];
  recentCompetitions: RecentCompetition[];
}

export interface CalculationResult {
  score: number;
  tier: string;
  salaryRange: string;
  breakdown: {
    roleScore: number;
    statsScore: number;
    socialScore: number;
    competitionScore: number;
    historyScore: number;
  };
}