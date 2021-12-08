import { AfterRoutesInit, Injectable } from "@tsed/common";
import { TypeORMService } from "@tsed/typeorm";
import { Connection, Repository } from "typeorm";

@Injectable()
export class ORMService implements AfterRoutesInit {
  public connection: Connection;

  constructor(private ormService: TypeORMService) {
  }

  $afterRoutesInit() {
    this.connection = this.ormService.get("default")!; // get connection by name
  }

  async get(): Promise<Connection> {
    return this.connection;
  }

  async upsert<T>(repository: Repository<T>, data: T): Promise<T | undefined> {
    try {
      const result = await repository.save<T>(data);
      console.log("Succesfully created or updated.");
      return result;
    } catch (e) {
      console.log("Failed creating  or updated.");
      console.log(e);
    }
  }
}
