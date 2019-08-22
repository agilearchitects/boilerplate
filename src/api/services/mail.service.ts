import { MailGunService, mailGunService as mailgunServiceInstance } from "./mailgun.service";

export class MailService {
  public constructor(
    private readonly mailgunService: MailGunService = mailgunServiceInstance
  ) { }

  public send(from: string, to: string | string[], subject: string, html: string): Promise<void> {
    return this.mailgunService.send(from, to, subject, html);
  }
}

export const mailService: MailService = new MailService();