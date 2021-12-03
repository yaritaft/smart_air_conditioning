export enum HealthStatus {
  OK = "OK",
  NeedsFilter = "needs_filter",
  NeedsService = "needs_service",
}

export class ReportMetrics {
  temperature: number;
  humidity: number;
  carbonMonoxide: number;
}

export class Report {
  reportId: string;
  serialNumber: string;
  reportMetrics: ReportMetrics;
  healthStatus: HealthStatus;
  timestampCreatedInDeviceAt: Date;
  timestampReceivedInServerAt: Date;
}
