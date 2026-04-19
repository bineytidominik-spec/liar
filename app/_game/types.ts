export const PHASE = {
  SETUP: 'setup',
  PLAYERS: 'players',
  CONFIG: 'config',
  HANDOFF: 'handoff',
  REVEAL: 'reveal',
  DISCUSSION: 'discussion',
  VOTE: 'vote',
  RESULT: 'result',
  SCOREBOARD: 'scoreboard',
} as const;

export type Phase = typeof PHASE[keyof typeof PHASE];
export type ImposterMode = 'blank' | 'similar';
export type WordSource = 'categories' | 'custom';

export type CurrentWord = {
  word: string;
  association: string;
};

export type CustomWord = {
  word: string;
  associations: string[];
};

export type Scores = Record<string, number>;
export type Votes = Record<string, string>;

export type ResultData = {
  imposterNames: string[];
  voteCounts: Record<string, number>;
  imposterCaught: boolean;
  topVoted: string[];
};
