export enum GameMode {
  CLASSIC = 'CLASSIC',
  TIME = 'TIME'
}

export interface Block {
  id: string;
  value: number;
  isSelected: boolean;
}

export interface GameState {
  grid: (Block | null)[][]; // rows x cols
  target: number;
  score: number;
  mode: GameMode;
  isGameOver: boolean;
  timeLeft: number;
  combo: number;
}

export const GRID_ROWS = 10;
export const GRID_COLS = 6;
export const INITIAL_ROWS = 4;
export const TIME_LIMIT = 10; // seconds for time mode
