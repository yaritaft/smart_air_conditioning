import { EntitySchema } from "typeorm";
import { AdminAccount } from "../models/AdminAccount";

export const AdminAccountEntity = new EntitySchema<AdminAccount>({
  name: "AdminAccount",
  target: AdminAccount,
  columns: {
    username: { type: String, primary: true },
    name: { type: String },
    surname: { type: String },
    token: {
      type: String,
      nullable: true,
    },
    salt: {
      type: String,
    },
    hashedPass: {
      type: String,
    },
  },
});
