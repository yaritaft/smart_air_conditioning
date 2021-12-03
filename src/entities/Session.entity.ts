import { EntitySchema } from "typeorm";
import { DeviceAccount } from "../models/DeviceSession";

export const SessionEntity = new EntitySchema<DeviceAccount>({
  name: "DeviceAccount",
  target: DeviceAccount,
  columns: {
    token: {
      type: String,
      generated: "uuid",
      nullable: true,
    },
    serialNumber: {
      type: String,
      primary: true,
    },
    salt: {
      type: String,
    },
    hashedPass: {
      type: String,
    },
    firstRegistration: {
      type: "timestamptz",
      nullable: true,
      default: null,
    },
    mostRecentRegistration: {
      type: "timestamptz",
      nullable: true,
      default: null,
    },
  },
});
