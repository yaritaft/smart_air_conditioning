import { PlatformTest } from "@tsed/common";
import * as SuperTest from "supertest";
import { Server } from "../../server";
import { Connection, createConnection } from "typeorm";
import { Report } from "../../models/Report";
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
      const headers = { Accept: "application/json", token: "482ffc8e-79cf-40b1-a9e0-586334c250bb" };
      const response = await request.post("/api/session/device/register").send(bodyDeviceRegistry).set({
        headers,
      });
      // Test refresh token
      const recentlyRegisteredDevices = await request.get("/api/analytics/recently-registered-devices").set(headers);
      expect(recentlyRegisteredDevices.body.data.devices.length).toEqual(1);
      expect(recentlyRegisteredDevices.status).toEqual(200);
    });
  });
  describe("Get reports from device by daterange", () => {
    it("Get reports from device by daterange", async () => {
      const bodyDeviceRegistry = {
        serialNumber: "1",
        password: "1",
      };
      const headers = { Accept: "application/json", token: "482ffc8e-79cf-40b1-a9e0-586334c250bb" };
      const headersDevice = { Accept: "application/json", token: "482ffc8e-79cf-40b1-a9e0-586334c250bb" };

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
      await request.post("/api/device/report").send(bodyReports).set(headersDevice);
      await request.post("/api/device/report").send(bodyReports2).set(headersDevice);
      // Test refresh token
      const body = {
        serialNumber: "1",
        dateFrom: "2021-06-12T04:42:53.560Z",
        dateTo: "2021-06-17T04:42:53.560Z",
      };
      const readingsByDeviceByDateRange = await request.post("/api/analytics/reports-from-device-by-daterange").send(body).set(headers);
      expect(readingsByDeviceByDateRange.body.data.reports.length).toEqual(1);
      expect(readingsByDeviceByDateRange.status).toEqual(200);
    });
  });
  describe("Get active alerts", () => {
    it("Get active alerts", async () => {
      const headers = { Accept: "application/json", token: "482ffc8e-79cf-40b1-a9e0-586334c250bb" };
      const headersDevice = { Accept: "application/json", token: "482ffc8e-79cf-40b1-a9e0-586334c250bb" };
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
      await request.post("/api/device/report").send(bodyReports).set(headersDevice);
      const readingsByDeviceByDateRange = await request.get("/api/analytics/active-alerts").set(headers);
      expect(readingsByDeviceByDateRange.body.data.alerts.length).toEqual(1);
      expect(readingsByDeviceByDateRange.status).toEqual(200);
    });
  });
});
