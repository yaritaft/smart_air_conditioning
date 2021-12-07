import { hashSync, genSaltSync } from "bcrypt-nodejs";
import { AdminAccount } from "../models/AdminAccount";
import { DeviceAccount } from "../models/DeviceSession";

export class DeviceSessionCoreService {
  async addEncodedPassword(password: string, account: DeviceAccount | AdminAccount): Promise<DeviceAccount | AdminAccount> {
    const salt = await genSaltSync(10);
    account.hashedPass = await hashSync(password, salt);
    return account;
  }

  checkSameHashedPassword(attemptingPassword: string, account: DeviceAccount | AdminAccount): Boolean {
    const hashedAttemptingPassword = hashSync(attemptingPassword, account.salt);
    return account.hashedPass === hashedAttemptingPassword;
  }
}
