import { Inject, Injectable } from "@tsed/common";
import { Between } from "typeorm";
import { HealthStatus, Report } from "../models/Report";
import { ReportEntity } from "../entities/Report.entity";
import { AlertService } from "./AlertService";
import { SessionService } from "./SessionService";
import { TypeORMService } from "@tsed/typeorm";

export interface UpdateACResponse {
  healthStatus: HealthStatus;
}

@Injectable()
export class ReportService {
  @Inject()
  private ormService: TypeORMService;

  @Inject()
  private sessionService: SessionService;

  @Inject()
  private alertsService: AlertService;

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

    const repository = this.ormService.get().getRepository(ReportEntity);

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
    const repository = this.ormService.get().getRepository(ReportEntity);

    return repository.find({
      where: {
        serialNumber,
        timestampCreatedInDeviceAt: Between(dateFrom, dateTo)
      }
    });
  }
}
