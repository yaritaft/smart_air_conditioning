import { BodyParams, Controller, Get, Inject, Post } from "@tsed/common";
import { DeviceSession, DeviceLoginSession, NewDeviceToken } from "../models/DeviceSession";
import { ApiDataResponse, ApiErrorResponse } from "./types/ApiResponses";
import { SessionService } from "../services/SessionService";
import { HttpResponse, Ok } from "./types/HttpResponses";

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
    const token = await this.sessionService.register(body.serialNumber, body.password);
    return new Ok(token);
  }
}
