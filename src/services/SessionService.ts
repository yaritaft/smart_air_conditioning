import { Service } from "@tsed/di";
import { Injectable } from "@tsed/common";
import { ORMService } from "./ORMService";
import { DeviceAccountEntity } from "../entities/DeviceAccount.entity";
import { AdminAccountEntity } from "../entities/AdminAccount.entity";
import { DeviceAccount, NewDeviceToken } from "../models/DeviceSession";
import { DeviceSessionCoreService } from "../core/SessionCore";
import { v4 as uuidv4 } from "uuid";
import { IsNull, Not } from "typeorm";

@Service()
@Injectable()
export class SessionService {
  constructor(private ormService: ORMService, private deviceSessionCoreService: DeviceSessionCoreService) {
  }

  async gatherUserIdByToken(token: string) {
    const repository = this.ormService.connection.getRepository(AdminAccountEntity);

    return repository.findOne({ token });
  }

  // async generateToken(userId: string): Promise<string> {
  //   const repository = this.ormService.connection.getRepository(AdminAccountEntity);
  //   const session = await repository.save({ userId });
  //   console.log("Token generated.");
  //   return session.token;
  // }

  async getTokenByUserId(username: string) {
    const repository = this.ormService.connection.getRepository(AdminAccountEntity);
    const session = await repository.findOne({ username });
    return session?.token;
  }

  async logAdmin(username: string, password: string): Promise<{ token: string }> {
    const repository = this.ormService.connection.getRepository(AdminAccountEntity);
    const adminAccount = await repository.findOne({ username });
    if (adminAccount === undefined) {
      throw new Error(`No user called ${username} exists.`);
    }
    const isEqual = this.deviceSessionCoreService.checkSameHashedPassword(password, adminAccount);
    if (!isEqual) {
      throw new Error("No valid password.");
    }
    const newToken = uuidv4();
    await repository.save({ ...adminAccount, token: newToken });
    return { token: newToken };
  }

  async logoutAdmin(token: string): Promise<void> {
    const user = await this.gatherUserIdByToken(token);
    if (user === undefined) {
      throw new Error(`No user with given token.`);
    }
    const repository = this.ormService.connection.getRepository(AdminAccountEntity);
    await repository.save({ ...user, token: null } as any);
  }

  async getDeviceByToken(token: string): Promise<DeviceAccount> {
    const repository = this.ormService.connection.getRepository(DeviceAccountEntity);
    const deviceAccount = await repository.findOne({ token });
    if (deviceAccount === undefined) {
      throw new Error("No device found with given token.");
    }
    return deviceAccount;
  }

  async getRecentlyRegistered(token: string) {
    const user = await this.gatherUserIdByToken(token);
    if (user === undefined || user === null) {
      throw new Error("No user found with given token.");
    }
    const repository = this.ormService.connection.getRepository(DeviceAccountEntity);
    const deviceAccounts = await repository.find({
      where: {
        mostRecentRegistration: Not(IsNull())
      },
      order: {
        mostRecentRegistration: "DESC"
      }
    });

    return deviceAccounts.map((deviceAccount) => ({
      serialNumber: deviceAccount.serialNumber,
      mostRecentRegistration: deviceAccount.mostRecentRegistration
    }));
  }

  // Register === Gather token with serial number + password
  async registerDevice(serialNumber: string, password: string): Promise<NewDeviceToken> {
    const repository = this.ormService.connection.getRepository(DeviceAccountEntity);
    const deviceAccount = await repository.findOne({
      where: [{ serialNumber }]
    });

    if (deviceAccount === undefined) {
      throw new Error("No device with serial number provided");
    }

    const isEqual = this.deviceSessionCoreService.checkSameHashedPassword(password, deviceAccount);

    if (!isEqual) {
      throw new Error("No valid password.");
    }

    console.log("User registered.");
    const currentUTCTimestamp = new Date().toISOString();
    const newToken = uuidv4();
    const updates = {
      firstRegistration: deviceAccount.firstRegistration || currentUTCTimestamp,
      mostRecentRegistration: currentUTCTimestamp,
      token: newToken
    };

    repository.save({ ...deviceAccount, ...updates });

    return { token: newToken };
  }
}
