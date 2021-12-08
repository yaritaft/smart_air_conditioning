export class DeviceSession {
  token: string;
  userId: string;
}

export interface DeviceTokenHeader {
  authorization: string;
}

export class DeviceLoginSession {
  serialNumber: string;
  password: string;
}

export class NewDeviceToken {
  token: string;
}

export class DeviceAccount {
  deviceAccountId: string;
  hashedPass: string;
  salt: string;
  token: string;
  firstRegistration?: Date;
  mostRecentRegistration?: Date;
  // FK device
  serialNumber: string;
}
