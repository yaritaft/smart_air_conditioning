import { BodyParams, Controller, Get, HeaderParams, Inject, Post } from "@tsed/common";
import { Report } from "../models/Report";
import { Ok } from "./types/HttpResponses";
import { ReportService } from "../services/ReportService";
import { AlertService } from "../services/AlertService";
import { SessionService } from "../services/SessionService";

@Controller("/analytics")
export class AnalyticsController {
  @Inject()
  reportService: ReportService;
  @Inject()
  alertService: AlertService;
  @Inject()
  sessionService: SessionService;

  private async validateAuth({ token }: { token: string }) {
    const user = await this.sessionService.gatherUserIdByToken(token);
    if (!user) {
      throw new Error("Not valid token");
    }
  }

  @Get("/recently-registered-devices")
  async getRecentlyRegisteredDevices(
    @BodyParams() body: Omit<Report, "timestampReceivedInServerAt">[],
    @HeaderParams() header: { token: string }
  ): Promise<any> {
    this.validateAuth(header);
    const result = await this.sessionService.getRecentlyRegistered(header.token);
    return new Ok({ devices: result });
  }

  // TODO: Convert to get with url ids for dates and device
  @Post("/aggregate-reports-from-device-by-daterange")
  async aggreagateReportsFromDeviceByDateRange(
    @BodyParams() body: Omit<Report, "timestampReceivedInServerAt">[],
    @HeaderParams() header: { token: string }
  ): Promise<any> {
    this.validateAuth(header);
    const result = await this.reportService.processReports(header.token, body);
    return new Ok(result);
  }
  @Get("/active-alerts")
  async getActiveAlerts(
    @BodyParams() body: Omit<Report, "timestampReceivedInServerAt">[],
    @HeaderParams() header: { token: string }
  ): Promise<any> {
    this.validateAuth(header);
    const result = await this.alertService.getActiveAlerts();
    return new Ok({ alerts: result });
  }
  // TODO: Convert to get with url ids for dates and device
  @Post("/reports-from-device-by-daterange")
  async reportsFromDeviceByDateRange(
    @BodyParams() body: { serialNumber: string; dateFrom: string; dateTo: string },
    @HeaderParams() header: { token: string }
  ): Promise<any> {
    this.validateAuth(header);
    const result = await this.reportService.reportsFromDeviceByDateRange(body);
    return new Ok({ reports: result });
  }
}
