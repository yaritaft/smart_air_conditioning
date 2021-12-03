import { hashSync, genSaltSync } from "bcrypt-nodejs";
import { DeviceAccount } from "../models/DeviceSession";

export class DeviceSessionCoreService {
  async addEncodedPassword(password: string, deviceAccount: DeviceAccount): Promise<DeviceAccount> {
    const salt = await genSaltSync(10);
    deviceAccount.hashedPass = await hashSync(password, salt);
    return deviceAccount;
  }

  checkSameHashedPassword(attemptingPassword: string, deviceAccount: DeviceAccount): Boolean {
    const hashedAttemptingPassword = hashSync(attemptingPassword, deviceAccount.salt);
    return deviceAccount.hashedPass === hashedAttemptingPassword;
  }
}
