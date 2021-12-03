import "reflect-metadata";
import { Service } from "@tsed/di";
import { Injectable } from "@tsed/common";
import { ORMService } from "./ORMService";
import { SessionEntity } from "../entities/Session.entity";
import { DeviceAccount, NewDeviceToken } from "../models/DeviceSession";
import { DeviceSessionCoreService } from "../core/SessionCore";
import { v4 as uuidv4 } from "uuid";

@Service()
@Injectable()
export class SessionService {
  constructor(private ormService: ORMService, private deviceSessionCoreService: DeviceSessionCoreService) {}

  // async gatherUserIdByToken(token: string): Promise<string> {
  //   const repository = this.ormService.connection.getRepository(SessionEntity);
  //   const session = await repository.findOne({ token });
  //   return session.userId;
  // }

  // async generateToken(userId: string): Promise<string> {
  //   const repository = this.ormService.connection.getRepository(SessionEntity);
  //   const session = await repository.save({ userId });
  //   console.log("Token generated.");
  //   return session.token;
  // }

  // async getTokenByUserId(userId: string): Promise<string> {
  //   const repository = this.ormService.connection.getRepository(SessionEntity);
  //   const session = await repository.findOne({ userId });
  //   return session.token;
  // }
  // Register === Gather token with serial number + password
  async register(serialNumber: string, password: string): Promise<NewDeviceToken> {
    const repository = this.ormService.connection.getRepository(SessionEntity);
    const deviceAccount: DeviceAccount = await repository.findOne({
      where: [{ serialNumber }],
    });
    if (deviceAccount === undefined) {
      throw new Error("No device with serial number provided");
    }
    const isEqual = this.deviceSessionCoreService.checkSameHashedPassword(password, deviceAccount);
    if (!isEqual) {
      throw new Error("No valid password.");
    }
    console.log("User registered.");
    const currentUTCTimestamp = new Date();
    const updates = {
      firstRegistration: deviceAccount.firstRegistration || currentUTCTimestamp,
      mostRecentRegistration: currentUTCTimestamp,
      token: uuidv4(),
    };
    repository.save({ ...deviceAccount, ...updates });
    return { token: deviceAccount.token };
  }
}
