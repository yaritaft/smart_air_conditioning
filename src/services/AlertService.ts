import { v4 as uuidv4 } from "uuid";
import { Inject, Injectable } from "@tsed/common";
import { Repository } from "typeorm";
import { Report } from "../models/Report";
import { ReportEntity } from "../entities/Report.entity";
import { Alert, ResolveState, ViewState } from "../models/Alert";
import { AlertEntity } from "../entities/Alert.entity";
import { TypeORMService } from "@tsed/typeorm";
import { InjectRepository } from "../decorators/injectRepository";

interface CreateAlert {
  errors: string | undefined;
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

@Injectable()
export class AlertService {
  @Inject()
  private ormService: TypeORMService;

  @InjectRepository(AlertEntity)
  private alertRepository: Repository<Alert>;

  @InjectRepository(ReportEntity)
  private reportRepository: Repository<Report>;

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
      viewState: ViewState.NEW
    };
    await repositoryReport.save({ ...report, alertId: newAlert.alertId });
    await repository.save(newAlert);
    return newAlert;
  }

  async solveAlert(activeAlert: Alert, repository: Repository<Alert>): Promise<void> {
    await repository.save({
      ...activeAlert,
      timestampAlertSolvedInDeviceAt: new Date().toISOString(),
      resolveState: ResolveState.RESOLVED
    });
  }

  async addReportToAlertList(report: Report, activeAlert: Alert, repositoryReport: Repository<Report>): Promise<Report> {
    const updatedReport: Report = { ...report, alertId: activeAlert.alertId };
    await repositoryReport.save(updatedReport);
    return updatedReport;
  }

  async processActiveAlert({
                             errors,
                             activeAlert,
                             report,
                             repository,
                             repositoryReport
                           }: HandleActiveAlert): Promise<void> {
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
    const repository = this.alertRepository;
    const repositoryReport = this.reportRepository;

    for (const report of reports) {
      await this.processAlert({ report, repository, repositoryReport, serialNumber });
    }

    return this.alertRepository.findOne({ resolveState: ResolveState.NEW, serialNumber });
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return this.alertRepository.find({ resolveState: ResolveState.NEW });
  }
}
