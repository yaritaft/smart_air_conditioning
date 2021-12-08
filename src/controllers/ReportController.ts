import { BodyParams, Controller, HeaderParams, Inject, Post } from "@tsed/common";
import { Report } from "../models/Report";
import { Ok } from "./types/HttpResponses";
import { ReportService } from "../services/ReportService";

@Controller("/device")
export class UserController {
  @Inject()
  reportService: ReportService;

  @Post("/report")
  async processReports(
    @BodyParams() body: { reports: Omit<Report, "timestampReceivedInServerAt">[] },
    @HeaderParams() header: { token: string }
  ): Promise<any> {
    const result = await this.reportService.processReports(header.token, body.reports);
    return new Ok(result);
  }
}
