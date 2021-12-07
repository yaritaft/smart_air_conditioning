import { Alert } from "./Alert";
import { DeviceAccount } from "./DeviceSession";
import { Report } from "./Report";

export class Device {
  serialNumber: string;
  mostRecentFirmwareVersion: string;

  // FKs deviceAccount
  deviceAccountId: string;
  // reports?: Report[];
  // deviceAccount?: DeviceAccount;
  // alerts?: Alert[];
}
