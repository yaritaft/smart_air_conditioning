// import { Connection, createConnection, getRepository, MigrationInterface, QueryRunner } from "typeorm";
// import { DeviceEntity } from "../entities/Device.entity";
// import { DeviceAccountEntity } from "../entities/DeviceAccount.entity";
// import { Device } from "../models/Device";
// import { DeviceAccount } from "../models/DeviceSession";

// export class deviceAccountSeed1638681405110 implements MigrationInterface {
//   name = "deviceAccountSeed1638681405110";

//   public async up(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.query(
//       "INSERT INTO device_account (\"serialNumber\",\"token\", \"hashedPass\", \"salt\",  \"deviceAccountId\") VALUES ('1', '482ffc8e-79cf-40b1-a9e0-586334c250bb','$2a$10$rIS1yCjDlOvkUc2SUAYqSuKTuEt5Iyj5sfXz6LIs7K0TPyZyplnw6','$2a$10$rIS1yCjDlOvkUc2SUAYqSu','1')"
//     );
//     // await queryRunner.query(
//     //   "INSERT INTO device_account (\"serialNumber\", \"token\", \"hashedPass\", \"salt\",  \"deviceAccountId\") VALUES ('1','61d39ad0-9133-48ed-b5b1-825b0ac756ef','$2a$10$smyIgNKTBbBTG9TT8q.V1OMvCociUHuDghjzeMip0rIPunaa.KL/C','$2a$10$smyIgNKTBbBTG9TT8q.V1O','1')"
//     // );
//     // await queryRunner.query(
//     //   "INSERT INTO device_account (\"serialNumber\", \"token\", \"hashedPass\", \"salt\",  \"deviceAccountId\") VALUES ('2','020d790c-5cf2-4bdf-b857-170dd7e6a5e8','$2a$10$fWW0x.hqSq1znEsMW3gw1urdOwW20aYiMpusPpN0Steox8.ceK0x.','$2a$10$fWW0x.hqSq1znEsMW3gw1u','2')"
//     // );
//     // await queryRunner.query(
//     //   "INSERT INTO device_account (\"serialNumber\", \"token\", \"hashedPass\", \"salt\",  \"deviceAccountId\") VALUES ('3','77ffb4b5-55eb-48af-9140-c08dcec9a784','$2a$10$RGyShO3CfWS1.bwAXAVUSumjyiSg5XkXGHdQ22ABru9CT6Z/v78s2','$2a$10$RGyShO3CfWS1.bwAXAVUSu','3')"
//     // );
//     // await queryRunner.query(
//     //   "INSERT INTO device_account (\"serialNumber\", \"token\", \"hashedPass\", \"salt\",  \"deviceAccountId\") VALUES ('4','86e4bafd-21c0-4e85-b71f-b1ef77949453','$2a$10$gr2/7685Tt7twNf.KItslu0D4rSObltIeVpdGaE0nvjJJDJbbKd0K','$2a$10$gr2/7685Tt7twNf.KItslu','4')"
//     // );
//     // await queryRunner.query(
//     //   "INSERT INTO device_account (\"serialNumber\", \"token\", \"hashedPass\", \"salt\",  \"deviceAccountId\") VALUES ('5','0f89f7fd-b129-4157-9d69-a4132d54d391','$2a$10$oGduBGbA7immPKrx9wKrTekTlTjshOvtqzsGtxBKm0GGbw6U0BZDm','$2a$10$oGduBGbA7immPKrx9wKrTe','5')"
//     // );
//     // await queryRunner.query(
//     //   "INSERT INTO device_account (\"serialNumber\", \"token\", \"hashedPass\", \"salt\",  \"deviceAccountId\") VALUES ('6','c9ec43d4-8904-4149-82ae-ac2e047936af','$2a$10$OhjDWfctz6J5iASFAT8i6.mwKPkQ98AIbJiSlLxKmk86jxS9CvbF2','$2a$10$OhjDWfctz6J5iASFAT8i6.', '6')"
//     // );
//     // await queryRunner.query(
//     //   "INSERT INTO device_account (\"serialNumber\", \"token\", \"hashedPass\", \"salt\",  \"deviceAccountId\") VALUES ('7','688a9983-1d35-4390-bef8-fcf0603eb95f','$2a$10$qJl9av1TW9YORWiuLH2TGO.mpO2DXa08dxOSFzMLJG9JPoBvxQRiK','$2a$10$qJl9av1TW9YORWiuLH2TGO', '7')"
//     // );
//     // await queryRunner.query(
//     //   "INSERT INTO device_account (\"serialNumber\", \"token\", \"hashedPass\", \"salt\",  \"deviceAccountId\") VALUES ('8','f2c5860b-c3e9-4c96-8280-b57757797062','$2a$10$q//4VH6eoyv3g0/VDaSUWOwlV8QRpE2yXcSMgADRe5rV/wbMoPSvu','$2a$10$q//4VH6eoyv3g0/VDaSUWO', '8')"
//     // );
//     // await queryRunner.query(
//     //   "INSERT INTO device_account (\"serialNumber\", \"token\", \"hashedPass\", \"salt\",  \"deviceAccountId\") VALUES ('9','261e2519-6d4d-4105-b2c8-2ab105307fe3','$2a$10$faWtAvdMGLMPX1hVoU.a2uAAmxvyNoSdtpBb7H0amnUi/3e9VM6.S','$2a$10$faWtAvdMGLMPX1hVoU.a2u', '9')"
//     // );
//     // await queryRunner.query(
//     //   "INSERT INTO device_account (\"serialNumber\", \"token\", \"hashedPass\", \"salt\",  \"deviceAccountId\") VALUES ('10','07a2bbcc-dcaf-4bd9-8cc8-9086049584b4','$2a$10$BMBKdXKXxAzBlEZofEULbuwZ73sQuGlYHXHyk6rL3GNmITh.PLVle','$2a$10$BMBKdXKXxAzBlEZofEULbu', '10')"
//     // );
//     // await queryRunner.query(
//     //   "INSERT INTO device_account (\"serialNumber\", \"token\", \"hashedPass\", \"salt\",  \"deviceAccountId\") VALUES ('11','506d23eb-a340-4d32-a2da-1b4b7c26efab','$2a$10$l1TZ2rp4ogjL2f5PgHlvX.xHMu8Q95rcJ6N4UCbhQ7vnNG1Rdo7dW','$2a$10$l1TZ2rp4ogjL2f5PgHlvX.', '11')"
//     // );
//     // await queryRunner.query(
//     //   "INSERT INTO device_account (\"serialNumber\", \"token\", \"hashedPass\", \"salt\",  \"deviceAccountId\") VALUES ('12','131ce43c-e11a-48d6-a0b0-33c003c0f2ac','$2a$10$2xW0fDJntbcDQNueEe7Ol.GhHtjWuuqiD5uYYF.nMZ7/iVEfBQrM6','$2a$10$2xW0fDJntbcDQNueEe7Ol.', '12')"
//     // );
//     // await queryRunner.query(
//     //   "INSERT INTO device_account (\"serialNumber\", \"token\", \"hashedPass\", \"salt\",  \"deviceAccountId\") VALUES ('13','5957b0da-c888-475e-979f-10b4f8824aff','$2a$10$GOLJjoBzDwplXwjlp7QHteRA1/WFQ7j4wC1ngHe9FBI5Tk0TthI8O','$2a$10$GOLJjoBzDwplXwjlp7QHte', '13')"
//     // );
//     // await queryRunner.query(
//     //   "INSERT INTO device_account (\"serialNumber\", \"token\", \"hashedPass\", \"salt\",  \"deviceAccountId\") VALUES ('14','2f8f794e-c0bf-4679-be3f-08983cbbe3ee','$2a$10$pYHdAOcLhh28BIJMsuIouOX7Ib9OkMy1gaUdQddM34nUBDlAU3JKu','$2a$10$pYHdAOcLhh28BIJMsuIouO', '14')"
//     // );
//   }

//   public async down(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.query("DELETE FROM device_account");
//   }
// }
