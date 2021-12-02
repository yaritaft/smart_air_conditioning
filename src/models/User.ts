export class User {
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  createdAt?: Date;
  salt?: string;
}