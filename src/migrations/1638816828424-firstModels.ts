import {MigrationInterface, QueryRunner} from "typeorm";

export class firstModels1638816828424 implements MigrationInterface {
    name = 'firstModels1638816828424'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "report" ADD "alertId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "report" DROP COLUMN "alertId"`);
    }

}
