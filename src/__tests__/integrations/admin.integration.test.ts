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

const eraseData = async (connection: Connection) => {
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
    console.log(JSON.stringify(PlatformTest.callback()));
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
  });
  afterAll(async () => {
    await eraseData(connection);
    await PlatformTest.reset();
    await connection.close();
  });

  describe("Post /api/session/admin/login", () => {
    it("Register user", async () => {
      const bodyAdminLogin = {
        username: "0",
        password: "0",
      };
      await connection.query(
        "INSERT INTO admin_account (\"username\", \"token\", \"hashedPass\", \"salt\", \"name\", \"surname\") VALUES ('0','482ffc8e-79cf-40b1-a9e0-586334c250bb','$2a$10$rIS1yCjDlOvkUc2SUAYqSuKTuEt5Iyj5sfXz6LIs7K0TPyZyplnw6','$2a$10$rIS1yCjDlOvkUc2SUAYqSu', 'Barry','White')"
      );
      const response = await axios.post("http://0.0.0.0:8080/api/session/admin/login", bodyAdminLogin, {
        headers: { Accept: "application/json" },
      });
      expect(response.data.data.token).toBeTruthy();
      expect(response.status).toEqual(200);
      // Test refresh token
      const response2 = await axios.post("http://0.0.0.0:8080/api/session/admin/login", bodyAdminLogin, {
        headers: { Accept: "application/json" },
      });
      expect(response.data.data.token).not.toEqual(response2.data.data.token);
      expect(response2.status).toEqual(200);
    });
  });

  describe("Logout /api/session/admin/logout", () => {
    it("Register user", async () => {
      const bodyAdminLogin = {
        username: "0",
        password: "0",
      };
      await connection.query(
        "INSERT INTO admin_account (\"username\", \"token\", \"hashedPass\", \"salt\", \"name\", \"surname\") VALUES ('0','482ffc8e-79cf-40b1-a9e0-586334c250bb','$2a$10$rIS1yCjDlOvkUc2SUAYqSuKTuEt5Iyj5sfXz6LIs7K0TPyZyplnw6','$2a$10$rIS1yCjDlOvkUc2SUAYqSu', 'Barry','White')"
      );
      const response = await axios.post("http://0.0.0.0:8080/api/session/admin/login", bodyAdminLogin, {
        headers: { Accept: "application/json" },
      });
      const responseLogout = await axios.post("http://0.0.0.0:8080/api/session/admin/logout", bodyAdminLogin, {
        headers: { Accept: "application/json", token: response.data.data.token },
      });
      expect(response.status).toEqual(200);
    });
  });
});
