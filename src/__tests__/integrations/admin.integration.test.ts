import { PlatformTest } from "@tsed/common";
import SuperTest from "supertest";
import { Server } from "../../server";
import { Connection, createConnection } from "typeorm";
import { AdminAccountEntity } from "../../entities/AdminAccount.entity";

const eraseData = async (connection: Connection) => {
  await connection.getRepository(AdminAccountEntity).delete({});
};

describe("Rest", () => {
  // bootstrap your Server to load all endpoints before run your test
  let request: SuperTest.SuperTest<SuperTest.Test>;
  let connection: Connection;
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
      entities: ["src/**/*.entity.ts"]
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
    });
  });
});
