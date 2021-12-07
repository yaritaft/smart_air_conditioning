import { PlatformTest } from "@tsed/common";
import * as SuperTest from "supertest";
import { Server } from "../../server";
import axios from "axios";
import { Connection, createConnection } from "typeorm";
import { DeviceEntity } from "../../entities/Device.entity";
import { DeviceAccountEntity } from "../../entities/DeviceAccount.entity";
import { PlatformExpress } from "@tsed/platform-express";
import { UserController } from "../../controllers/ReportController";
import { ReportEntity } from "../../entities/Report.entity";
import { AlertEntity } from "../../entities/Alert.entity";
import { HealthStatus } from "../../models/Report";
import { ResolveState } from "../../models/Alert";

const eraseData = async (connection: Connection) => {
  await connection.getRepository(ReportEntity).delete({});
  await connection.getRepository(AlertEntity).delete({});
  await connection.getRepository(DeviceEntity).delete({});
  await connection.getRepository(DeviceAccountEntity).delete({});
};

describe("Rest", () => {
  // bootstrap your Server to load all endpoints before run your test
  let request: SuperTest.SuperTest<SuperTest.Test>;
  let connection: Connection | undefined;
  // beforeAll(PlatformTest.bootstrap(Server));
  // // afterAll(PlatformTest.reset);
  beforeAll(async () => {
    await PlatformTest.bootstrap(Server);
    await PlatformTest.create();
    await PlatformTest.invoke(UserController, []);
  });

  beforeAll(async () => {
    request = SuperTest.agent(PlatformTest.callback());
    await createConnection({
      name: "seed",
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "123456789",
      database: "mydatabase",
      synchronize: true,
      entities: ["dist/**/*.entity.js"],
    }).then(async (newConnection) => {
      connection = newConnection;
    });
  });

  beforeEach(async () => {
    await eraseData(connection);
    await connection.query(
      "INSERT INTO device (\"serialNumber\", \"deviceAccountId\", \"mostRecentFirmwareVersion\") VALUES ('1','1','222');"
    );
    await connection.query(
      "INSERT INTO device_account (\"serialNumber\",\"token\", \"hashedPass\", \"salt\",  \"deviceAccountId\") VALUES ('1', '482ffc8e-79cf-40b1-a9e0-586334c250bb','$2a$10$smyIgNKTBbBTG9TT8q.V1OMvCociUHuDghjzeMip0rIPunaa.KL/C','$2a$10$smyIgNKTBbBTG9TT8q.V1O','1')"
    );
    // await connection.synchronize();
    // const connectionSeed = db.get("seed");
    // await connectionSeed.runMigrations();
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
      const headers = {
        headers: { Accept: "application/json", token: "482ffc8e-79cf-40b1-a9e0-586334c250bb" },
      };

      const response = await axios.post("http://0.0.0.0:8080/api/device/report", bodyReports, headers);
      const report = await (await connection.getRepository(ReportEntity)).findOne({ reportId: "report3" });
      expect(report.alertId).toBeNull();
      expect(response.status).toEqual(200);
      expect(response.data.data.healthStatus).toEqual(HealthStatus.OK);
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
      const headers = {
        headers: { Accept: "application/json", token: "482ffc8e-79cf-40b1-a9e0-586334c250bb" },
      };

      const response = await axios.post("http://0.0.0.0:8080/api/device/report", bodyReports, headers);
      const dangerousReport = await (await connection.getRepository(ReportEntity)).findOne({ reportId: "report3" });
      const alert = await (await connection.getRepository(AlertEntity)).findOne({ alertId: dangerousReport.alertId });
      expect(alert.resolveState).toEqual(ResolveState.NEW);
      expect(response.status).toEqual(200);
      expect(response.data.data.healthStatus).toEqual(HealthStatus.NeedsService);
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
      const headers = {
        headers: { Accept: "application/json", token: "482ffc8e-79cf-40b1-a9e0-586334c250bb" },
      };

      const response = await axios.post("http://0.0.0.0:8080/api/device/report", bodyReports, headers);
      const dangerousReport = await (await connection.getRepository(ReportEntity)).findOne({ reportId: "report3" });
      const alert = await (await connection.getRepository(AlertEntity)).findOne({ alertId: dangerousReport.alertId });
      expect(alert.resolveState).toEqual(ResolveState.RESOLVED);
      expect(response.status).toEqual(200);
      expect(response.data.data.healthStatus).toEqual(HealthStatus.OK);
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
      const headers = {
        headers: { Accept: "application/json", token: "482ffc8e-79cf-40b1-a9e0-586334c250bb" },
      };

      const response = await axios.post("http://0.0.0.0:8080/api/device/report", bodyReports, headers);
      const response2 = await axios.post("http://0.0.0.0:8080/api/device/report", bodyReports2, headers);
      const dangerousReport = await (await connection.getRepository(ReportEntity)).findOne({ reportId: "report3" });
      const alert = await (await connection.getRepository(AlertEntity)).findOne({ alertId: dangerousReport.alertId });
      expect(alert.resolveState).toEqual(ResolveState.RESOLVED);
      expect(response.status).toEqual(200);
      expect(response.data.data.healthStatus).toEqual(HealthStatus.NeedsService);
      expect(response2.data.data.healthStatus).toEqual(HealthStatus.OK);
    });
  });
});
