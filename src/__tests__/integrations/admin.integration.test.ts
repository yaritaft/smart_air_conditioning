import { PlatformTest } from "@tsed/common";
import SuperTest from "supertest";
import { Server } from "../../server";
import { AdminAccountEntity } from "../../entities/AdminAccount.entity";
import { TypeORMService } from "@tsed/typeorm";

const eraseData = async (name: string) => {
  const service = PlatformTest.injector.get<TypeORMService>(TypeORMService)!;
  const connection = service.get(name);

  await connection.getRepository(AdminAccountEntity).delete({});
};

describe("Rest", () => {
  // bootstrap your Server to load all endpoints before run your test
  let request: SuperTest.SuperTest<SuperTest.Test>;

  beforeAll(PlatformTest.bootstrap(Server, {
    typeorm: [
      {
        name: "default",
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "postgres",
        password: "123456789",
        database: "mydatabase",
        synchronize: true,
        entities: ["src/**/*.entity.ts"]
      }
    ]
  }));
  beforeAll(async () => {
    request = SuperTest(PlatformTest.callback());

    await eraseData("default");
  });
  afterAll(async () => {
    await eraseData("default");
    return PlatformTest.reset();
  });

  describe("Post /api/session/admin/login", () => {
    it("Register user", async () => {
      console.log("here");
    });
  });
});
