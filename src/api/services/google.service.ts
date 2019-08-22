// Libs
import axios from "axios";

// Services
import { config } from "./config.service";
import { envService } from "./env.service";

import { LogModule } from "../modules/log.module";

export class GoogleService {
  public constructor(
    private readonly url: string,
    private readonly secret: string,
    private readonly axiosModule: typeof axios = axios,
    private readonly log: LogModule = new LogModule("GoogleService")
  ) { }

  public async verify(token: string, remoteIp: string): Promise<void> {
    try {
      return this.axiosModule.post(this.url, {
        secret: this.secret,
        response: token,
        remoteip: remoteIp,
      });

    } catch(error) {
      this.log.error({ title: "verify", message: "Something went wrong" }, error);
      throw error;
    }
  }

}

export const googleService = new GoogleService(
  config.recaptcha.url,
  envService.get("GOOGLE_RECAPTCHA_SECRET", ""),
);