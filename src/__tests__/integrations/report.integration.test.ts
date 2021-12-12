import { PlatformTest } from "@tsed/common";
import * as SuperTest from "supertest";
import { Server } from "../../server";
import { Connection, createConnection } from "typeorm";
import { ReportEntity } from "../../entities/Report.entity";
import { AlertEntity } from "../../entities/Alert.entity";
import { HealthStatus } from "../../models/Report";
import { ResolveState } from "../../models/Alert";
import { TypeORMService } from "@tsed/typeorm";

const eraseData = async (connection: Connection) => {
  await connection.dropDatabase();
  await connection.synchronize();
};

describe("Rest", () => {
  let request: SuperTest.SuperTest<SuperTest.Test>;
  let connection: Connection | undefined;

  beforeAll(async () => {
    await PlatformTest.bootstrap(Server)();
    request = SuperTest.agent(PlatformTest.callback());
    const db = new TypeORMService();
    connection = db.get("default");
  });

  beforeEach(async () => {
    await eraseData(connection);
    await connection.query(
      "INSERT INTO device (\"serialNumber\", \"deviceAccountId\", \"mostRecentFirmwareVersion\") VALUES ('1','1','222');"
    );
    await connection.query(
      "INSERT INTO device_account (\"serialNumber\",\"token\", \"hashedPass\", \"salt\",  \"deviceAccountId\") VALUES ('1', '482ffc8e-79cf-40b1-a9e0-586334c250bb','$2a$10$smyIgNKTBbBTG9TT8q.V1OMvCociUHuDghjzeMip0rIPunaa.KL/C','$2a$10$smyIgNKTBbBTG9TT8q.V1O','1')"
    );
  });

  afterAll(async () => {
    await eraseData(connection);
    await PlatformTest.reset();
    await connection.close();
  });

  describe("Post /api/device/report", () => {
    it("Register user", async () => {
      const bodyReports = {
        reports: [
          {
            reportId: "report3",
            serialNumber: 1,
            humidity: 33,
            carbonMonoxide: 44,
            temperature: 35,
            timestampCreatedInDeviceAt: "2021-12-06T04:42:53.560Z",
          },
        ],
      };
      const headers = { Accept: "application/json", token: "482ffc8e-79cf-40b1-a9e0-586334c250bb" };

      const response = await request.post("/api/device/report").send(bodyReports).set(headers);
      const report = await connection.getRepository(ReportEntity).findOne({ reportId: "report3" });
      expect(report.alertId).toBeNull();
      expect(response.status).toEqual(200);
      expect(response.body.data.healthStatus).toEqual(HealthStatus.OK);
    });
  });
  describe("Create alert /api/device/report", () => {
    it("Register user", async () => {
      const bodyReports = {
        reports: [
          {
            reportId: "report3",
            serialNumber: 1,
            humidity: 99999,
            carbonMonoxide: 44,
            temperature: 35,
            timestampCreatedInDeviceAt: "2021-12-06T04:42:53.560Z",
          },
        ],
      };
      const headers = { Accept: "application/json", token: "482ffc8e-79cf-40b1-a9e0-586334c250bb" };

      const response = await request.post("/api/device/report").send(bodyReports).set(headers);
      const dangerousReport = await (await connection.getRepository(ReportEntity)).findOne({ reportId: "report3" });
      const alert = await (await connection.getRepository(AlertEntity)).findOne({ alertId: dangerousReport.alertId });
      expect(alert.resolveState).toEqual(ResolveState.NEW);
      expect(response.status).toEqual(200);
      expect(response.body.data.healthStatus).toEqual(HealthStatus.NeedsService);
    });
  });
  describe("Solve alert /api/device/report", () => {
    it("Register user", async () => {
      const bodyReports = {
        reports: [
          {
            reportId: "report3",
            serialNumber: 1,
            humidity: 99999,
            carbonMonoxide: 44,
            temperature: 35,
            timestampCreatedInDeviceAt: "2021-12-06T04:42:53.560Z",
          },
          {
            reportId: "report4",
            serialNumber: 1,
            humidity: 55,
            carbonMonoxide: 44,
            temperature: 35,
            timestampCreatedInDeviceAt: "2021-12-06T04:43:53.560Z",
          },
        ],
      };
      const headers = { Accept: "application/json", token: "482ffc8e-79cf-40b1-a9e0-586334c250bb" };

      const response = await request.post("/api/device/report").send(bodyReports).set(headers);
      const dangerousReport = await (await connection.getRepository(ReportEntity)).findOne({ reportId: "report3" });
      const alert = await (await connection.getRepository(AlertEntity)).findOne({ alertId: dangerousReport.alertId });
      expect(alert.resolveState).toEqual(ResolveState.RESOLVED);
      expect(response.status).toEqual(200);
      expect(response.body.data.healthStatus).toEqual(HealthStatus.OK);
    });
  });
  describe("Solve alert in two requests /api/device/report", () => {
    it("Register user", async () => {
      const bodyReports = {
        reports: [
          {
            reportId: "report3",
            serialNumber: 1,
            humidity: 99999,
            carbonMonoxide: 44,
            temperature: 35,
            timestampCreatedInDeviceAt: "2021-12-06T04:42:53.560Z",
          },
        ],
      };
      const bodyReports2 = {
        reports: [
          {
            reportId: "report4",
            serialNumber: 1,
            humidity: 55,
            carbonMonoxide: 44,
            temperature: 35,
            timestampCreatedInDeviceAt: "2021-12-06T04:43:53.560Z",
          },
        ],
      };
      const headers = { Accept: "application/json", token: "482ffc8e-79cf-40b1-a9e0-586334c250bb" };

      const response = await request.post("/api/device/report").send(bodyReports).set(headers);
      const response2 = await request.post("/api/device/report").send(bodyReports2).set(headers);
      const dangerousReport = await (await connection.getRepository(ReportEntity)).findOne({ reportId: "report3" });
      const alert = await (await connection.getRepository(AlertEntity)).findOne({ alertId: dangerousReport.alertId });
      expect(alert.resolveState).toEqual(ResolveState.RESOLVED);
      expect(response.status).toEqual(200);
      expect(response.body.data.healthStatus).toEqual(HealthStatus.NeedsService);
      expect(response2.body.data.healthStatus).toEqual(HealthStatus.OK);
    });
  });
});
