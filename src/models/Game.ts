export enum CellState {
  Flagged = "Flagged",
  Checked = "Checked",
  Question = "Question",
  Unchecked = "Unchecked",
}

export enum GameState {
  InProgress = "InProgress",
  Stopped = "Stopped",
  Won = "Won",
  Lost = "Lost",
}

export interface CellCoordinates {
  x: number;
  y: number;
}

export class Cell {
  state: CellState;
  mine: boolean;
}

export class Game {
  gameId?: string;
  matrix?: Cell[][];
  state: GameState;
  amountOfMines: number;
  userId: string;
  secondsElapsed?: number;
  secondsStopped?: number;
  createdAt: Date;
  finishedAt?: Date;
  stoppedAt?: Date;
  resumedAt?: Date;
}
