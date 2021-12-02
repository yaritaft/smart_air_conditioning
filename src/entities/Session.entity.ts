import {EntitySchema} from "typeorm";
import { Session } from "../models/Session";

export const SessionEntity = new EntitySchema<Session>({
  name: "Session",
  target: Session,
  columns: {
    token: {
      type: String,
      primary: true,
      generated: "uuid"
    },
    userId: {
      type: String
    }
  }
});