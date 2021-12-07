import { Alert } from "./Alert";
import { Device } from "./Device";

export enum HealthStatus {
  OK = "OK",
  NeedsFilter = "needs_filter",
  NeedsService = "needs_service",
}

export class Report {
  reportId: string;
  serialNumber: string;
  humidity: number;
  carbonMonoxide: number;
  temperature: number;
  healthStatus?: HealthStatus;
  timestampCreatedInDeviceAt: string;
  timestampReceivedInServerAt?: string;
  // FK alert
  alertId?: string;
}
