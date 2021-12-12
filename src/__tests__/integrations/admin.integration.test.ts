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

  describe("Post /api/session/admin/login", () => {
    it("Register user", async () => {
      const bodyAdminLogin = {
        username: "0",
        password: "0",
      };
      await connection.query(
        "INSERT INTO admin_account (\"username\", \"token\", \"hashedPass\", \"salt\", \"name\", \"surname\") VALUES ('0','482ffc8e-79cf-40b1-a9e0-586334c250bb','$2a$10$rIS1yCjDlOvkUc2SUAYqSuKTuEt5Iyj5sfXz6LIs7K0TPyZyplnw6','$2a$10$rIS1yCjDlOvkUc2SUAYqSu', 'Barry','White')"
      );
      const response = await request
        .post("/api/session/admin/login")
        .send(bodyAdminLogin)
        .set({
          headers: { Accept: "application/json" },
        });
      expect(response.body.data.token).toBeTruthy();
      expect(response.status).toEqual(200);
      // Test refresh token
      const response2 = await request
        .post("/api/session/admin/login")
        .send(bodyAdminLogin)
        .set({
          headers: { Accept: "application/json" },
        });
      expect(response.body.data.token).not.toEqual(response2.body.data.token);
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
      const response = await request
        .post("/api/session/admin/login")
        .send(bodyAdminLogin)
        .set({
          headers: { Accept: "application/json" },
        });
      const responseLogout = await request
        .post("/api/session/admin/logout")
        .send(bodyAdminLogin)
        .set({
          headers: { Accept: "application/json", token: response.body.data.token },
        });
      expect(response.status).toEqual(200);
    });
  });
});
