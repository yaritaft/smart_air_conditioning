import { PlatformTest } from "@tsed/common";
import * as SuperTest from "supertest";
import { Server } from "../../server";
import { Connection } from "typeorm";
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
  });

  afterAll(async () => {
    await eraseData(connection);
    await PlatformTest.reset();
    await connection.close();
  });
  describe("Post /api/session/device/register", () => {
    it("Register user", async () => {
      const bodyDeviceRegistry = {
        serialNumber: "1",
        password: "1",
      };
      await connection.query(
        "INSERT INTO device (\"serialNumber\", \"deviceAccountId\", \"mostRecentFirmwareVersion\") VALUES ('1','1','222');"
      );
      await connection.query(
        "INSERT INTO device_account (\"serialNumber\",\"token\", \"hashedPass\", \"salt\",  \"deviceAccountId\") VALUES ('1', '482ffc8e-79cf-40b1-a9e0-586334c250bb','$2a$10$smyIgNKTBbBTG9TT8q.V1OMvCociUHuDghjzeMip0rIPunaa.KL/C','$2a$10$smyIgNKTBbBTG9TT8q.V1O','1')"
      );
      const response = await request
        .post("/api/session/device/register")
        .send(bodyDeviceRegistry)
        .set({
          headers: { Accept: "application/json" },
        });
      expect(response.body.data.token).toBeTruthy();
      expect(response.status).toEqual(200);
      // Test refresh token
      const response2 = await request
        .post("/api/session/device/register")
        .send(bodyDeviceRegistry)
        .set({
          headers: { Accept: "application/json" },
        });
      expect(response.body.data.token).not.toEqual(response2.body.data.token);
      expect(response2.status).toEqual(200);
    });
  });

  describe("Not valid password Post /api/session/device/register", () => {
    it("Register user", async () => {
      const bodyDeviceRegistry = {
        serialNumber: "1",
        password: "2",
      };
      await connection.query(
        "INSERT INTO device (\"serialNumber\", \"deviceAccountId\", \"mostRecentFirmwareVersion\") VALUES ('1','1','222');"
      );
      await connection.query(
        "INSERT INTO device_account (\"serialNumber\",\"token\", \"hashedPass\", \"salt\",  \"deviceAccountId\") VALUES ('1', '482ffc8e-79cf-40b1-a9e0-586334c250bb','$2a$10$smyIgNKTBbBTG9TT8q.V1OMvCociUHuDghjzeMip0rIPunaa.KL/C','$2a$10$smyIgNKTBbBTG9TT8q.V1O','1')"
      );
      request
        .post("/api/session/device/register")
        .send(bodyDeviceRegistry)
        .set({
          headers: { Accept: "application/json" },
        })
        .catch((error) => {
          expect(error.response.status).toEqual(500);
        });
    });
  });
  describe("Not valid device Post /api/session/device/register", () => {
    it("Register user", async () => {
      const bodyDeviceRegistry = {
        serialNumber: "2",
        password: "1",
      };
      await connection.query(
        "INSERT INTO device (\"serialNumber\", \"deviceAccountId\", \"mostRecentFirmwareVersion\") VALUES ('1','1','222');"
      );
      await connection.query(
        "INSERT INTO device_account (\"serialNumber\",\"token\", \"hashedPass\", \"salt\",  \"deviceAccountId\") VALUES ('1', '482ffc8e-79cf-40b1-a9e0-586334c250bb','$2a$10$smyIgNKTBbBTG9TT8q.V1OMvCociUHuDghjzeMip0rIPunaa.KL/C','$2a$10$smyIgNKTBbBTG9TT8q.V1O','1')"
      );
      request
        .post("/api/session/device/register")
        .send(bodyDeviceRegistry)
        .set({
          headers: { Accept: "application/json" },
        })
        .catch((error) => {
          expect(error.response.status).toEqual(500);
        });
    });
  });
});
