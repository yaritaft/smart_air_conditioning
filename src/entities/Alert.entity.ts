import { EntitySchema } from "typeorm";
import { Alert, ResolveState, ViewState } from "../models/Alert";

export const AlertEntity = new EntitySchema<Alert>({
  name: "Alert",
  target: Alert,
  columns: {
    alertId: {
      type: String,
      primary: true,
    },
    timestampAlertReceivedInServer: {
      type: "timestamptz",
      nullable: true,
      default: null,
    },
    timestampAlertCreatedInDeviceAt: {
      type: "timestamptz",
      nullable: true,
      default: null,
    },
    timestampAlertSolvedInDeviceAt: {
      type: "timestamptz",
      nullable: true,
      default: null,
    },
    textualAlert: {
      type: String,
    },
    resolveState: {
      type: "enum",
      enum: ResolveState,
      default: ResolveState.NEW,
    },
    viewState: {
      type: "enum",
      enum: ViewState,
      default: ViewState.NEW,
    },
    serialNumber: {
      type: String,
    },
  },
  // relations: {
  //   reports: {
  //     type: "one-to-many",
  //     target: "Report", // CategoryEntity
  //     cascade: true,
  //   },
  //   device: {
  //     type: "many-to-one",
  //     target: "Device", // CategoryEntity
  //     cascade: true,
  //   },
  // },
});
