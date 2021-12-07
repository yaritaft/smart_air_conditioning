import { MigrationInterface, QueryRunner } from "typeorm";

export class createDevice1638681405100 implements MigrationInterface {
  name = "createDevice1638681405100";
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "INSERT INTO device (\"serialNumber\", \"deviceAccountId\", \"mostRecentFirmwareVersion\") VALUES ('1','1','222');"
    );
    await queryRunner.query(
      "INSERT INTO device_account (\"serialNumber\",\"token\", \"hashedPass\", \"salt\",  \"deviceAccountId\") VALUES ('1', '482ffc8e-79cf-40b1-a9e0-586334c250bb','$2a$10$smyIgNKTBbBTG9TT8q.V1OMvCociUHuDghjzeMip0rIPunaa.KL/C','$2a$10$smyIgNKTBbBTG9TT8q.V1O','1')"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DELETE FROM device");
    await queryRunner.query("DELETE FROM device_account");
  }
}
