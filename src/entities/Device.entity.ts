import { EntitySchema } from "typeorm";
import { Device } from "../models/Device";

export const DeviceEntity = new EntitySchema<Device>({
  name: "Device",
  target: Device,
  columns: {
    serialNumber: {
      type: String,
      primary: true,
    },
    mostRecentFirmwareVersion: { type: String },
    // Fk device account
    deviceAccountId: {
      type: String,
      nullable: true,
    },
  },
  // relations: {
  //   reports: {
  //     type: "one-to-many",
  //     target: "Report", // CategoryEntity
  //     nullable: true,
  //   },
  //   alerts: {
  //     type: "one-to-many",
  //     target: "Alert", // CategoryEntity
  //     nullable: true,
  //   },
  //   deviceAccount: {
  //     type: "one-to-one",
  //     target: "DeviceAccount", // CategoryEntity
  //     nullable: true,
  //   },
  // },
});
