// Libs
import * as changeCase from "change-case";
import { LogModule } from "../modules/log.module";
import { dictionary } from "../server";
import { EjsService, ejsService as ejsServiceInstance } from "./ejs.service";

type emailPayload = { subject: string, message: string };

export class TemplateService {
  public constructor(
    private readonly basePath: string = "storage/email-templates",
    private readonly ejsService: EjsService = ejsServiceInstance,
    private readonly changeCaseModule: typeof changeCase = changeCase,
    private readonly log: LogModule = new LogModule("TemplateService"),
  ) { }

  /**
   * Get email template data specifed by name
   * @param name Name of email
   * @param vars variables to pass when generating template data
   */
  public async email(name: string, vars?: dictionary<string>): Promise<emailPayload> {
    const paramCaseName = this.changeCaseModule.paramCase(name);
    try {
      return {
        subject: await this.ejsService.fromFile(`${this.basePath}/${paramCaseName}-subject.txt.ejs`, vars),
        message: await this.ejsService.fromFile(`${this.basePath}/${paramCaseName}.html.ejs`, vars)
      };
    } catch(error) {
      this.log.error({ title: "email", message: "Something went wrong" }, error);
      throw error;
    }
  }
}

export const templateService = new TemplateService();