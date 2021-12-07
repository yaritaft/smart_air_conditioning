import { MigrationInterface, QueryRunner } from "typeorm";

export class adminAccountSeed1638681405112 implements MigrationInterface {
  name = "adminAccountSeed1638681405112";
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "INSERT INTO admin_account (\"username\", \"token\", \"hashedPass\", \"salt\", \"name\", \"surname\") VALUES ('0','482ffc8e-79cf-40b1-a9e0-586334c250bb','$2a$10$rIS1yCjDlOvkUc2SUAYqSuKTuEt5Iyj5sfXz6LIs7K0TPyZyplnw6','$2a$10$rIS1yCjDlOvkUc2SUAYqSu', 'Barry','White')"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DELETE FROM admin_account");
  }
}
