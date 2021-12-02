export class Session {
  token: string;
  userId: string;
}

export interface TokenHeader{
    authorization: string;
}