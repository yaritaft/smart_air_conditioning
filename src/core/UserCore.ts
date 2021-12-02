import { User } from "../models/User";
import { hashSync, genSaltSync } from "bcrypt-nodejs";

export class UserCoreService {
  async addEncodedPassword(user: User): Promise<User> {
    const salt = await genSaltSync(10);
    user.salt = salt;
    user.password = await hashSync(user.password, user.salt);
    return user;
  }

  checkSameHashedPassword(attemptingPassword: string, userStored: User): Boolean {
    const hashedPassword = userStored.password;
    const hashedAttemptingPassword = hashSync(attemptingPassword, userStored.salt);
    return hashedPassword === hashedAttemptingPassword;
  }
}
