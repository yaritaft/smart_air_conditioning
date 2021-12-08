import { BodyParams, Controller, HeaderParams, Inject, Injectable, Post } from "@tsed/common";
import { DeviceLoginSession } from "../models/DeviceSession";
import { SessionService } from "../services/SessionService";
import { BadRequest, HttpResponse, Ok } from "./types/HttpResponses";
import { AdminLoginAttempt } from "../models/AdminAccount";

@Injectable()
@Controller("/session")
export class UserController {
  @Inject()
  sessionService: SessionService;

  // @Post("/register")
  // async register(@BodyParams() body: User): Promise<{userId: string}> {
  //   const userId = await this.userService.register(body);
  //   return userId;
  // }

  // @Post("/login")
  // async login(@BodyParams() body: {email: string, password: string}): Promise<TokenHeader> {
  //   const token = await this.userService.login(body.email, body.password);
  //   return token;
  // }

  // @Get("/status")
  // async getStatus(): Promise<{}> {
  //   return {};
  // }

  @Post("/device/register")
  async registerDevice(@BodyParams() body: DeviceLoginSession): Promise<HttpResponse> {
    const token = await this.sessionService.registerDevice(body.serialNumber, body.password);
    return new Ok(token);
  }

  @Post("/admin/login")
  async adminLogin(@BodyParams() body: AdminLoginAttempt): Promise<HttpResponse> {
    const token = await this.sessionService.logAdmin(body.username, body.password);
    return new Ok(token);
  }

  @Post("/admin/logout")
  async adminLogout(@HeaderParams() header: { token: string }): Promise<HttpResponse> {
    return await this.sessionService
      .logoutAdmin(header.token)
      .then(() => new Ok("Logged out successfully."))
      .catch(() => new BadRequest("Log out failed."));
  }
}
