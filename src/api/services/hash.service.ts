// Libs
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import * as fs from "fs";

// Types
import { functionType } from "../server";

export class HashService {
  public constructor(
    private readonly bcryptModule: typeof bcrypt = bcrypt,
    private readonly cryptoModule: typeof crypto = crypto,
    private readonly fsModule: typeof fs = fs,
  ) { }

  public create(text: string): string {
    return this.bcryptModule.hashSync(text, 10);
  }
  public check(text: string, hash: string): boolean {
    return this.bcryptModule.compareSync(text, hash);
  }
  public file(path: string): string {
    return this.cryptoModule.createHash("md5").update(this.fsModule.readFileSync(path).toString()).digest("hex");
  }
}

export const hashService = new HashService();