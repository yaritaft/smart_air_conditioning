import { hashSync, genSaltSync } from "bcrypt-nodejs";
import { v4 as uuidv4 } from "uuid";

for (let i = 0; i < 15; i++) {
  //   console.log(`Password: ${i}`);
  const salt = await genSaltSync(10);
  const hash = await hashSync(String(i), salt);
  //   console.log(`salt: ${salt} hash: ${hash}`);
  console.log(`${i} ${uuidv4()} ${hash} ${salt}`);
}
