import {MigrationInterface, QueryRunner} from "typeorm";

export class firstModels1638813212214 implements MigrationInterface {
    name = 'firstModels1638813212214'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admin_account" ("username" character varying NOT NULL, "name" character varying NOT NULL, "surname" character varying NOT NULL, "token" character varying, "salt" character varying NOT NULL, "hashedPass" character varying NOT NULL, CONSTRAINT "PK_a6a5b15c5c225de1b4ecbfef9e6" PRIMARY KEY ("username"))`);
        await queryRunner.query(`CREATE TABLE "alert" ("alertId" character varying NOT NULL, "timestampAlertReceivedInServer" TIMESTAMP WITH TIME ZONE, "timestampAlertCreatedInDeviceAt" TIMESTAMP WITH TIME ZONE, "timestampAlertSolvedInDeviceAt" TIMESTAMP WITH TIME ZONE, "textualAlert" character varying NOT NULL, "resolveState" "alert_resolvestate_enum" NOT NULL DEFAULT 'NEW', "viewState" "alert_viewstate_enum" NOT NULL DEFAULT 'NEW', "serialNumber" character varying NOT NULL, CONSTRAINT "PK_9ccb2852f976044582773bcd313" PRIMARY KEY ("alertId"))`);
        await queryRunner.query(`CREATE TABLE "device" ("serialNumber" character varying NOT NULL, "mostRecentFirmwareVersion" character varying NOT NULL, "deviceAccountId" character varying NOT NULL, CONSTRAINT "PK_bab48b552431d44a436fa02a49a" PRIMARY KEY ("serialNumber"))`);
        await queryRunner.query(`CREATE TABLE "device_account" ("deviceAccountId" character varying NOT NULL, "token" uuid DEFAULT uuid_generate_v4(), "salt" character varying NOT NULL, "hashedPass" character varying NOT NULL, "firstRegistration" TIMESTAMP WITH TIME ZONE, "mostRecentRegistration" TIMESTAMP WITH TIME ZONE, "serialNumber" character varying NOT NULL, CONSTRAINT "PK_ac192c1f9d12570363fa3e05c1a" PRIMARY KEY ("deviceAccountId"))`);
        await queryRunner.query(`CREATE TABLE "report" ("reportId" character varying NOT NULL, "timestampCreatedInDeviceAt" TIMESTAMP WITH TIME ZONE, "timestampReceivedInServerAt" TIMESTAMP WITH TIME ZONE, "humidity" integer NOT NULL, "carbonMonoxide" integer NOT NULL, "temperature" integer NOT NULL, "serialNumber" character varying NOT NULL, CONSTRAINT "PK_afde9e812f5547056a4c378be74" PRIMARY KEY ("reportId"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "report"`);
        await queryRunner.query(`DROP TABLE "device_account"`);
        await queryRunner.query(`DROP TABLE "device"`);
        await queryRunner.query(`DROP TABLE "alert"`);
        await queryRunner.query(`DROP TABLE "admin_account"`);
    }

}
