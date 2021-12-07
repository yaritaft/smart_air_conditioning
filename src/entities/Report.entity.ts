import { EntitySchema } from "typeorm";
import { Report } from "../models/Report";

export const ReportEntity = new EntitySchema<Report>({
  name: "Report",
  target: Report,
  columns: {
    reportId: {
      type: String,
      primary: true,
    },
    timestampCreatedInDeviceAt: {
      type: "timestamptz",
      nullable: true,
      default: null,
    },
    timestampReceivedInServerAt: {
      type: "timestamptz",
      nullable: true,
      default: null,
    },
    humidity: {
      type: Number,
    },
    carbonMonoxide: {
      type: Number,
    },
    temperature: {
      type: Number,
    },
    // FK device
    serialNumber: {
      type: String,
    },
    // FK alert
    alertId: {
      type: String,
      nullable: true,
    },
  },
  // relations: {
  //   alert: {
  //     type: "many-to-one",
  //     target: "Alert", // CategoryEntity
  //     nullable: true,
  //     cascade: true,
  //   },
  //   device: {
  //     type: "many-to-one",
  //     target: "Device", // CategoryEntity
  //     cascade: true,
  //   },
  // },
  // reportMetrics;
  // healthStatus;
  // timestampCreatedInDeviceAt;
  // timestampReceivedInServerAt;
});
