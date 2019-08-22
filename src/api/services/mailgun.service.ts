// Libs
import * as mailgunjs from "mailgun-js";

// Services
import { LogModule } from "../modules/log.module";
import { config } from "./config.service";
import { envService } from "./env.service";

export class MailGunService {
  public constructor(
    private readonly apiKey: string,
    private readonly domain: string,
    private readonly host: string,
    private readonly mailgunModule: mailgunjs.Mailgun = mailgunjs({
      apiKey,
      domain,
      host
    }),
    private readonly log: LogModule = new LogModule("MailGunService"),
  ) { }

  public async send(from: string, to: string | string[], subject: string, html: string): Promise<void> {
    try {
      await this.mailgunModule.messages().send({ from, to, subject, html });
      return;
    } catch(error) {
      this.log.error({ title: "send", message: "something went wrong" }, error);
      throw error;
    }
  }
}

export const mailGunService: MailGunService = new MailGunService(
  envService.get("MAILGUN_KEY", ""),
  envService.get("MAILGUN_DOMAIN", ""),
  config.mailgun.host,
);