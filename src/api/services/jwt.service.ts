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
    private readonly key: string = envService.get("TOKEN", Math.random().toString()),
    private readonly promise: typeof Promise = Promise,
    private readonly errorModule: typeof Error = Error,
    private readonly jsonwebtokenModule: typeof jsonwebtoken = jsonwebtoken,
    private readonly bannedTokenModel: typeof BannedTokenModel = BannedTokenModel,
    private readonly log: LogModule = new LogModule("JWTService"),
  ) { }

  public sign(payload: any, { key, expiresIn }: { key?: string, expiresIn?: string } = { key: this.key, expiresIn: "7 days" }): string {
    const token = this.jsonwebtokenModule.sign({ payload }, key || this.key, { expiresIn });
    if (typeof token !== "string") { throw new this.errorModule("Unable to sign"); }
    return token;
  }
  public decode<T>(token: string, key: string = this.key): Promise<tokenData<T>> {
    return new this.promise((resolve, reject) => {
      try {
        const decodedToken: string | rawTokenData<T> = this.jsonwebtokenModule.verify(token, key) as string | rawTokenData<T>;
        if (typeof decodedToken !== "object") {
          const error = new this.errorModule("Token did'n resolve to an object. Possibly wrong key") ;
          this.log.error("Error while decoding token");
          reject(error);
        } else {
          resolve({
            payload: decodedToken.payload,
            issuedAt: decodedToken.iat,
            expiresAt: decodedToken.exp
          });
        }
      } catch (error) {
        this.log.error("Error while decoding token", error);
        reject(error);
      }
    });
  }
  public async verify(token: string, key: string = this.key): Promise<boolean> {
    return !!this.decode(token, key);
  }

  public async isBanned(token: string, key: string = this.key): Promise<boolean> {
    try {
      const bannedToken = await this.bannedTokenModel.find({ where: { token }});
      return bannedToken !== undefined;
    } catch(error) {
      this.log.error({ title: "isBanned", message: "Something went wrong" }, error);
      throw error;
    }
  }
}

export const jwtService = new JWTService();
