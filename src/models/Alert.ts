import { HealthStatus, Report, ReportMetrics } from "./Report";

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
  report: Report;
  timestampAlertReceivedInServer: Date;
  timestampAlertCreatedInDeviceAt: Date;
  timestampAlertSolvedInDeviceAt?: Date;
  textualAlert: string;
  viewState: ViewState;
}
