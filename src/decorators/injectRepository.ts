import { Inject } from "@tsed/common";
import { TypeORMService } from "@tsed/typeorm";
import { EntitySchema } from "typeorm";

export function InjectRepository(entity: EntitySchema<any>, connection = "default") {
  return Inject(TypeORMService, (service: TypeORMService) => {
    return service.get(connection).getRepository(entity);
  });
}
