import { PlatformTest } from "@tsed/common";
import * as SuperTest from "supertest";
import { Server } from "../../server";
import axios from "axios";
import { Connection, createConnection } from "typeorm";
import { DeviceEntity } from "../../entities/Device.entity";
import { DeviceAccountEntity } from "../../entities/DeviceAccount.entity";
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
    request = SuperTest(PlatformTest.callback());
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
      entities: ["src/**/*.entity.ts"],
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
    it("Register user", async () => {});
  });
});
