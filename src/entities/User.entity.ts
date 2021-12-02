import { User } from "../models/User";
import { EntitySchema } from "typeorm";

export const UserEntity = new EntitySchema<User>({
  name: "User",
  target: User,
  columns: {
    userId: {
      type: String,
      primary: true,
      generated: "uuid",
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      nullable: true,
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    salt: {
      type: String,
      nullable: true,
    },
  },
});
