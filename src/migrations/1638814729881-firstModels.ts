import {MigrationInterface, QueryRunner} from "typeorm";

export class firstModels1638814729881 implements MigrationInterface {
    name = 'firstModels1638814729881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "device" ALTER COLUMN "deviceAccountId" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "device" ALTER COLUMN "deviceAccountId" SET NOT NULL`);
    }

}
