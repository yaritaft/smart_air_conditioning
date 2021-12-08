import { Device } from "./Device";
import { Report } from "./Report";

export enum ResolveState {
  NEW = "NEW",
  RESOLVED = "RESOLVED",
  IGNORED = "IGNORED",
}

export enum ViewState {
  VIEWED = "VIEWED",
  NEW = "NEW",
}

export class Alert {
  alertId: string;
  reports: Report[];
  timestampAlertReceivedInServer: string;
  timestampAlertCreatedInDeviceAt: string;
  timestampAlertSolvedInDeviceAt?: string;
  textualAlert: string | undefined;
  resolveState: ResolveState;
  viewState: ViewState;
  // FKS device
  serialNumber: string;
}
