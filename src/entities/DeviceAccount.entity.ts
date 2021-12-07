import { EntitySchema } from "typeorm";
import { DeviceAccount } from "../models/DeviceSession";

export const DeviceAccountEntity = new EntitySchema<DeviceAccount>({
  name: "DeviceAccount",
  target: DeviceAccount,
  columns: {
    deviceAccountId: { type: String, primary: true },
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
    // Fk device
    serialNumber: {
      type: String,
    },
  },
  // relations: {
  //   device: {
  //     type: "one-to-one",
  //     target: "Device", // CategoryEntity
  //     nullable: true,
  //   },
  // },
});
