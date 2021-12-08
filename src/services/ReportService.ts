import { Injectable } from "@tsed/common";
import { Between, Connection, Repository } from "typeorm";
import { ORMService } from "./ORMService";
import { HealthStatus, Report } from "../models/Report";
import { ReportEntity } from "../entities/Report.entity";
import { AlertService } from "./AlertService";
import { SessionService } from "./SessionService";

export interface UpdateACResponse {
  healthStatus: HealthStatus;
}

@Injectable()
export class ReportService {
  private connection: Connection;
  private repository: Repository<Report>;

  constructor(private ormService: ORMService, private sessionService: SessionService, private alertsService: AlertService) {
  }

  async processReports(token: string, reports: Omit<Report, "timestampReceivedInServerAt">[]): Promise<UpdateACResponse> {
    const device = await this.sessionService.getDeviceByToken(token);
    const reportsUpdated: Report[] = reports.map((report) => ({
      ...report,
      timestampReceivedInServerAt: new Date().toISOString()
    }));
    const orderedFromOlderToNewerReports = reportsUpdated.sort(
      (oneReport, otherReport) =>
        new Date(oneReport.timestampCreatedInDeviceAt).getTime() - new Date(otherReport.timestampCreatedInDeviceAt).getTime()
    );
    const repository = this.ormService.connection.getRepository(ReportEntity);
    for (const report of orderedFromOlderToNewerReports) {
      await repository.save(report);
    }
    const activeAfterReportsAlert = await this.alertsService.processAlerts(device.serialNumber, orderedFromOlderToNewerReports);
    return { healthStatus: activeAfterReportsAlert ? HealthStatus.NeedsService : HealthStatus.OK };
  }

  async reportsFromDeviceByDateRange({
                                       serialNumber,
                                       dateFrom,
                                       dateTo
                                     }: { serialNumber: string; dateFrom: string; dateTo: string }) {
    const repository = this.ormService.connection.getRepository(ReportEntity);

    return repository.find({
      where: {
        serialNumber,
        timestampCreatedInDeviceAt: Between(dateFrom, dateTo)
      }
    });
  }
}
