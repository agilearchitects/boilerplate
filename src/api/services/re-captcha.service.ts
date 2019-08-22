// Libs
import axios from "axios";

// Types
import { functionType } from "../server";

// Modules
import { LogModule } from "../modules/log.module";

// Services
import { GoogleService, googleService as googleServiceInstance } from "./google.service";

export class ReCaptchaService {
  public constructor(
    private readonly googleService: GoogleService = googleServiceInstance,
    private readonly log: LogModule = new LogModule("RecaptchaService")
  ) { }

  public verify(token: string, remoteIp: string): Promise<void> {
    return this.googleService.verify(token, remoteIp);
  }
}

export const reCaptchaService: ReCaptchaService = new ReCaptchaService();
