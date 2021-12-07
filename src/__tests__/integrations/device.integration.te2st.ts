import { PlatformTest } from "@tsed/common";
import * as SuperTest from "supertest";
import { Server } from "../../server";
import axios from "axios";
import { Connection, createConnection } from "typeorm";
import { DeviceEntity } from "../../entities/Device.entity";
import { DeviceAccountEntity } from "../../entities/DeviceAccount.entity";
import { PlatformExpress } from "@tsed/platform-express";
import { UserController } from "../../controllers/ReportController";

const eraseData = async (connection: Connection) => {
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
    }).then((newConnection) => {
      connection = newConnection;
    });
  });

  beforeEach(async () => {
    await eraseData(connection);
    // await connection.synchronize();
    // const connectionSeed = db.get("seed");
    // await connectionSeed.runMigrations();
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
      const response = await axios.post("http://0.0.0.0:8080/api/session/device/register", bodyDeviceRegistry, {
        headers: { Accept: "application/json" },
      });
      expect(response.data.data.token).toBeTruthy();
      expect(response.status).toEqual(200);
      // Test refresh token
      const response2 = await axios.post("http://0.0.0.0:8080/api/session/device/register", bodyDeviceRegistry, {
        headers: { Accept: "application/json" },
      });
      expect(response.data.data.token).not.toEqual(response2.data.data.token);
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
      axios
        .post("http://0.0.0.0:8080/api/session/device/register", bodyDeviceRegistry, {
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
      axios
        .post("http://0.0.0.0:8080/api/session/device/register", bodyDeviceRegistry, {
          headers: { Accept: "application/json" },
        })
        .catch((error) => {
          expect(error.response.status).toEqual(500);
        });
    });
  });
});
