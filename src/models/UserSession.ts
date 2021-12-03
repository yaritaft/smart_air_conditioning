export class UserSession {
  token: string;
  userId: string;
}

export interface UserTokenHeader {
  authorization: string;
}
