import { Game, GameState } from "../models/Game";
import {EntitySchema} from "typeorm";

export const GameEntity = new EntitySchema<Game>({
  name: "Game",
  target: Game,
  columns: {
    gameId: {
      type: String,
      primary: true,
      generated: "uuid"
    },
    userId: {
      type: "uuid",
      
    },
    matrix: {
      type: "jsonb",
      nullable: true
    },
    state: {
      type: "enum",
      enum: GameState
    },
    amountOfMines: {
      type: Number
    },
    secondsElapsed: {
      type: Number,
      default: 0
    },
    secondsStopped: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: new Date()
    },
    finishedAt: {
      type: Date,
      nullable: true
    },
    stoppedAt: {
      type: Date,
      nullable: true
    },
    resumedAt: {
      type: Date,
      nullable: true
    }
  }
});