export class AdminLoginAttempt {
  username: string;
  password: string;
}

export class AdminAccount {
  username: string;
  name: string;
  surname: string;
  hashedPass: string;
  salt: string;
  token: string;
}
