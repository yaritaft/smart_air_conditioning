import "reflect-metadata";
import { Service } from "@tsed/di";
import { Injectable } from "@tsed/common";
import { ORMService } from "./ORMService";
import { SessionService } from "./SessionService";
import { User } from "../models/User";
import { UserCoreService } from "../core/UserCore";
import { TokenHeader } from "../models/Session";
import { UserEntity } from "../entities/User.entity";

class WrongPasswordError extends Error {
  constructor(message: string) {
    super(message);
    console.error(message);
  }
}

class WrongEmailError extends Error {
  constructor(message: string) {
    super(message);
    console.error(message);
  }
}

@Service()
@Injectable()
export class UserService {
  constructor(private ormService: ORMService, private sessionService: SessionService, private userCoreService: UserCoreService) {}

  async login(email: string, password: string): Promise<TokenHeader> {
    const userRepository = this.ormService.connection.getRepository(UserEntity);
    const user = await userRepository.findOne({ email });
    if (!user) {
      throw new WrongEmailError("A wrong email was provided.");
    }
    if (!this.userCoreService.checkSameHashedPassword(password, user)) {
      throw new WrongPasswordError("A wrong password was provided.");
    }
    const token = await this.sessionService.getTokenByUserId(user.userId);
    return { authorization: token };
  }

  async register(userData: User): Promise<{userId: string}> {
    const repository = this.ormService.connection.getRepository(UserEntity);
    const userWithoutPassword = await this.ormService.upsert<User>(repository, userData);
    const userWithPassword = await this.userCoreService.addEncodedPassword(userWithoutPassword);
    const result = await this.ormService.upsert<User>(repository, userWithPassword);
    const token = await this.sessionService.generateToken(result.userId);
    console.log("User registered.");
    return {userId: result.userId};
  }
}
