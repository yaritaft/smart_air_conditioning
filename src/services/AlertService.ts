import { v4 as uuidv4 } from "uuid";
import { Service } from "@tsed/di";
import { Injectable } from "@tsed/common";
import { Connection, Repository } from "typeorm";
import "reflect-metadata";
import { ORMService } from "./ORMService";
import { Report } from "../models/Report";
import { ReportEntity } from "../entities/Report.entity";
import { Alert, ResolveState, ViewState } from "../models/Alert";
import { AlertEntity } from "../entities/Alert.entity";

interface CreateAlert {
  errors: string;
  report: Report;
  repository: Repository<Alert>;
  repositoryReport: Repository<Report>;
}

interface HandleActiveAlert extends CreateAlert {
  activeAlert: Alert;
}

interface ProcessAlert {
  report: Report;
  repository: Repository<Alert>;
  repositoryReport: Repository<Report>;
  serialNumber: string;
}
@Service()
@Injectable()
export class AlertService {
  private connection: Connection;
  private repository: Repository<Alert>;
  constructor(private ormService: ORMService) {}

  validTemperature(report: Report): boolean {
    return (
      report.temperature >= Number(process.env.TEMPERATURE_MIN_VALUE) && report.temperature <= Number(process.env.TEMPERATURE_MAX_VALUE)
    );
  }
  validHumidity(report: Report): boolean {
    return report.humidity >= Number(process.env.HUMIDITY_MIN_VALUE) && report.humidity <= Number(process.env.HUMIDITY_MAX_VALUE);
  }
  validCarbonMonoxide(report: Report): boolean {
    return (
      report.carbonMonoxide >= Number(process.env.CARBON_MONOXIDE_MIN_VALUE) &&
      report.carbonMonoxide <= Number(process.env.CARBON_MONOXIDE_MAX_VALUE)
    );
  }
  validateReport(report: Report): string | undefined {
    const errors: string[] = [];

    if (!this.validTemperature(report)) {
      errors.push("Temperature is out of range.");
    }
    if (!this.validHumidity(report)) {
      errors.push("humidity is out of range.");
    }
    if (!this.validCarbonMonoxide(report)) {
      errors.push("Carbon Monoxide is out of range.");
    }
    return errors.length > 0 ? errors.join(" ") : undefined;
  }

  async createNewAlert({ errors, report, repository, repositoryReport }: CreateAlert): Promise<Alert> {
    const newAlert: Alert = {
      alertId: uuidv4(),
      reports: [report],
      serialNumber: report.serialNumber,
      timestampAlertReceivedInServer: new Date().toISOString(),
      timestampAlertCreatedInDeviceAt: report.timestampCreatedInDeviceAt,
      textualAlert: errors,
      resolveState: ResolveState.NEW,
      viewState: ViewState.NEW,
    };
    await repositoryReport.save({ ...report, alertId: newAlert.alertId });
    await repository.save(newAlert);
    return newAlert;
  }

  async solveAlert(activeAlert: Alert, repository: Repository<Alert>): Promise<void> {
    await repository.save({
      ...activeAlert,
      timestampAlertSolvedInDeviceAt: new Date().toISOString(),
      resolveState: ResolveState.RESOLVED,
    });
  }

  async addReportToAlertList(report: Report, activeAlert: Alert, repositoryReport: Repository<Report>): Promise<Report> {
    const updatedReport: Report = { ...report, alertId: activeAlert.alertId };
    await repositoryReport.save(updatedReport);
    return updatedReport;
  }

  async processActiveAlert({ errors, activeAlert, report, repository, repositoryReport }: HandleActiveAlert): Promise<void> {
    if (!errors) {
      await this.solveAlert(activeAlert, repository);
    } else {
      await this.addReportToAlertList(report, activeAlert, repositoryReport);
    }
  }

  async processAlert({ report, repository, repositoryReport, serialNumber }: ProcessAlert): Promise<void> {
    const errors = this.validateReport(report);
    const activeAlert = await repository.findOne({ resolveState: ResolveState.NEW, serialNumber });
    if (activeAlert) {
      await this.processActiveAlert({ errors, activeAlert, report, repository, repositoryReport });
    } else if (errors) {
      await this.createNewAlert({ errors, report, repository, repositoryReport });
    }
  }

  async processAlerts(serialNumber: string, reports: Report[]): Promise<Alert | undefined> {
    const repository = this.ormService.connection.getRepository(AlertEntity);
    const repositoryReport = this.ormService.connection.getRepository(ReportEntity);
    for (const report of reports) {
      await this.processAlert({ report, repository, repositoryReport, serialNumber });
    }
    const activeAlert = await repository.findOne({ resolveState: ResolveState.NEW, serialNumber });
    return activeAlert;
  }

  async getActiveAlerts(): Promise<Alert[]> {
    const repository = this.ormService.connection.getRepository(AlertEntity);
    const activeAlerts = await repository.find({ resolveState: ResolveState.NEW });
    return activeAlerts;
  }
}
