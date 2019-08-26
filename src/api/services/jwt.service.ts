// Libs
import * as jsonwebtoken from "jsonwebtoken";

// Models
import { BannedTokenModel } from "../models/banned-token.model";

// Services
import { LogModule } from "../modules/log.module";
import { envService } from "./env.service";

type rawTokenData<T> = { payload: T, iat: number, exp: number };
export type tokenData<T> = { payload: T, issuedAt: number, expiresAt: number };

export class JWTService {
  public constructor (
    private readonly promise: typeof Promise = Promise,
    private readonly errorModule: typeof Error = Error,
    private readonly jsonwebtokenModule: typeof jsonwebtoken = jsonwebtoken,
    private readonly bannedTokenModel: typeof BannedTokenModel = BannedTokenModel,
    private readonly log: LogModule = new LogModule("JWTService"),
  ) { }

  public sign<T>(payload: T, key: string, expiresIn: string): string {
    const token = this.jsonwebtokenModule.sign({ payload }, key, { expiresIn });
    if (typeof token !== "string") { throw new this.errorModule("Unable to sign"); }
    return token;
  }
  public async decode<T>(token: string, key: string): Promise<tokenData<T>> {
    try {
      const decodedToken: string | rawTokenData<T> = this.jsonwebtokenModule.verify(token, key) as string | rawTokenData<T>;
      if (typeof decodedToken !== "object") {
        const error = new this.errorModule("Token did'n resolve to an object. Possibly wrong key") ;
        this.log.error("Error while decoding token");
        throw error;
      } else {
        return {
          payload: decodedToken.payload,
          issuedAt: decodedToken.iat,
          expiresAt: decodedToken.exp
        };
      }
    } catch (error) {
      this.log.error("Error while decoding token", error);
      throw error;
    }
  }
  public async verify(token: string, key: string): Promise<boolean> {
    return !!this.decode(token, key);
  }
}

export const jwtService = new JWTService();
