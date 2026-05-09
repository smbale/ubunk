export type WeightClass = 'Sparring Partner' | 'Flyweight' | 'Welterweight' | 'Middleweight' | 'Heavyweight' | 'G.O.A.T.';

export interface Fighter {
  uid: string;
  username: string;
  photoURL?: string;
  reputationPoints: number;
  weightClass: WeightClass;
  record: {
    wins: number;
    losses: number;
    draws: number;
  };
  streak: number;
  lastActive: any; // Firestore Timestamp
}

export type Verdict = 'BUNK' | 'TRUTH' | 'DISQUALIFIED' | 'SPLIT DECISION';
export type Category = 'LEGIT_MYTH' | 'NONSENSE' | 'DANGEROUS' | 'WEIRD_FACT';

export interface Fight {
  id: string;
  userId: string;
  username: string;
  mythContent: string;
  verdict: Verdict;
  category: Category;
  officialName: string;
  taleOfTheTape: string[];
  knockoutPunch: string;
  reliabilityScore: number;
  cheers: number;
  videoUrl?: string;
  timestamp: any; // Firestore Timestamp
}

export interface HallOfFameEntry {
  id: string;
  userId: string;
  username: string;
  achievementType: 'WEEKLY_CHAMP' | 'MYTH_RETIRER';
  achievementDate: any;
  metadata: any;
}
