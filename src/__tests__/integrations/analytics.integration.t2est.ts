import { PlatformTest } from "@tsed/common";
import * as SuperTest from "supertest";
import { Server } from "../../server";
import axios from "axios";
import { Connection, createConnection } from "typeorm";
import { DeviceEntity } from "../../entities/Device.entity";
import { DeviceAccountEntity } from "../../entities/DeviceAccount.entity";
import { PlatformExpress } from "@tsed/platform-express";
import { UserController } from "../../controllers/ReportController";
import { AdminAccountEntity } from "../../entities/AdminAccount.entity";
import { ReportEntity } from "../../entities/Report.entity";
import { AlertEntity } from "../../entities/Alert.entity";
import { Device } from "../../models/Device";
import { Report } from "../../models/Report";
import { Alert } from "../../models/Alert";

const eraseData = async (connection: Connection) => {
  await connection.getRepository(ReportEntity).delete({});
  await connection.getRepository(AlertEntity).delete({});
  await connection.getRepository(DeviceEntity).delete({});
  await connection.getRepository(DeviceAccountEntity).delete({});
  await connection.getRepository(AdminAccountEntity).delete({});
};

describe("Rest", () => {
  // bootstrap your Server to load all endpoints before run your test
  let request: SuperTest.SuperTest<SuperTest.Test>;
  let connection: Connection | undefined;
  // beforeAll(PlatformTest.bootstrap(Server));
  // // afterAll(PlatformTest.reset);
  beforeAll(async () => {
    await PlatformTest.bootstrap(Server);
  });

  beforeAll(async () => {
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
    }).then((newConnection) => {
      connection = newConnection;
    });
  });

  beforeEach(async () => {
    await eraseData(connection);
    await connection.query(
      "INSERT INTO admin_account (\"username\", \"token\", \"hashedPass\", \"salt\", \"name\", \"surname\") VALUES ('0','482ffc8e-79cf-40b1-a9e0-586334c250bb','$2a$10$rIS1yCjDlOvkUc2SUAYqSuKTuEt5Iyj5sfXz6LIs7K0TPyZyplnw6','$2a$10$rIS1yCjDlOvkUc2SUAYqSu', 'Barry','White')"
    );
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

  describe("Get /recently-registered-devices", () => {
    it("Get recently-registered-devices", async () => {
      const bodyDeviceRegistry = {
        serialNumber: "1",
        password: "1",
      };
      const headers = {
        headers: { Accept: "application/json", token: "482ffc8e-79cf-40b1-a9e0-586334c250bb" },
      };
      const response = await axios.post("http://0.0.0.0:8080/api/session/device/register", bodyDeviceRegistry, {
        headers,
      });
      // Test refresh token
      const recentlyRegisteredDevices = await axios.get<{
        data: { devices: Device[] };
      }>("http://0.0.0.0:8080/api/analytics/recently-registered-devices", headers);
      expect(recentlyRegisteredDevices.data.data.devices.length).toEqual(1);
      expect(recentlyRegisteredDevices.status).toEqual(200);
    });
  });
  describe("Get reports from device by daterange", () => {
    it("Get reports from device by daterange", async () => {
      const bodyDeviceRegistry = {
        serialNumber: "1",
        password: "1",
      };
      const headers = {
        headers: { Accept: "application/json", token: "482ffc8e-79cf-40b1-a9e0-586334c250bb" },
      };
      const headersDevice = {
        headers: { Accept: "application/json", token: "482ffc8e-79cf-40b1-a9e0-586334c250bb" },
      };

      const bodyReports = {
        reports: [
          {
            reportId: "report3",
            serialNumber: 1,
            humidity: 47,
            carbonMonoxide: 32,
            temperature: 11,
            timestampCreatedInDeviceAt: "2021-06-13T04:42:53.560Z",
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
            timestampCreatedInDeviceAt: "2021-06-10T04:43:53.560Z",
          },
        ],
      };
      await axios.post("http://0.0.0.0:8080/api/device/report", bodyReports, headersDevice);
      await axios.post("http://0.0.0.0:8080/api/device/report", bodyReports2, headersDevice);
      // Test refresh token
      const body = {
        serialNumber: "1",
        dateFrom: "2021-06-12T04:42:53.560Z",
        dateTo: "2021-06-17T04:42:53.560Z",
      };
      const readingsByDeviceByDateRange = await axios.post<{
        data: { reports: Report[] };
      }>("http://0.0.0.0:8080/api/analytics/reports-from-device-by-daterange", body, headers);
      expect(readingsByDeviceByDateRange.data.data.reports.length).toEqual(1);
      expect(readingsByDeviceByDateRange.status).toEqual(200);
    });
  });
  describe("Get active alerts", () => {
    it("Get active alerts", async () => {
      const headers = {
        headers: { Accept: "application/json", token: "482ffc8e-79cf-40b1-a9e0-586334c250bb" },
      };
      const headersDevice = {
        headers: { Accept: "application/json", token: "482ffc8e-79cf-40b1-a9e0-586334c250bb" },
      };
      interface BodyReport {
        reports: Report[];
      }

      const bodyReports: BodyReport = {
        reports: [
          {
            reportId: "report888",
            serialNumber: "1",
            humidity: 4,
            carbonMonoxide: 44,
            temperature: 35,
            timestampCreatedInDeviceAt: "2021-06-12T04:43:53.560Z",
          },
          {
            reportId: "report777",
            serialNumber: "1",
            humidity: 99999,
            carbonMonoxide: 32,
            temperature: 11,
            timestampCreatedInDeviceAt: "2021-06-14T04:42:53.560Z",
          },
        ],
      };
      await axios.post("http://0.0.0.0:8080/api/device/report", bodyReports, headersDevice);
      const readingsByDeviceByDateRange = await axios.get<{
        data: { alerts: Alert[] };
      }>("http://0.0.0.0:8080/api/analytics/active-alerts", headers);
      expect(readingsByDeviceByDateRange.data.data.alerts.length).toEqual(1);
      expect(readingsByDeviceByDateRange.status).toEqual(200);
    });
  });
});
