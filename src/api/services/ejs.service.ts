import * as ejs from "ejs";
import * as fs from "fs";
import { LogModule } from "../modules/log.module";
import { dictionary } from "../server";

export class EjsService {
  public constructor(
    private readonly ejsModule: typeof ejs = ejs,
    private readonly fsModule: typeof fs = fs,
    private readonly log: LogModule = new LogModule("EjsService"),
  ) { }

  public async fromString(template: string, data?: dictionary<any>): Promise<string> {
    try {
      return this.ejsModule.render(template, data, { async: true });
    } catch(error) {
      this.log.error({ title: "fromString", message: "Something went wrong" }, error);
      throw error;
    }
  }

  public async fromFile(path: string, data?: dictionary<any>): Promise<string> {
    try {
      return this.fromString(this.fsModule.readFileSync(path, "utf8"), data);
    } catch(error) {
      this.log.error({ title: "fromFile", message: "Something went wrong" }, error);
      throw error;
    }
  }
}

export const ejsService: EjsService = new EjsService();