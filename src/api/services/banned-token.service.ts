import { BannedTokenDTO } from "../../dto/banned-token.dto";
import { BannedTokenModel } from "../models/banned-token.model";
import { LogModule } from "../modules/log.module";

export class BannedTokenService {
  public constructor(
    private readonly bannedTokenModel: typeof BannedTokenModel = BannedTokenModel,
    private readonly log: LogModule = new LogModule("BannedTokenService"),
  ) {}
  public async get(token: string): Promise<BannedTokenDTO | undefined> {
    try {
      const bannedToken = await this.bannedTokenModel.findOne({ where: { token }});
      return bannedToken !== undefined ? BannedTokenDTO.parse({
        token: bannedToken.token,
      }) : undefined;
    } catch(error) {
      this.log.error({ title: "get", message: "Something went wrong" }, error);
      throw error;
    }
  }
}

export const bannedTokenService: BannedTokenService = new BannedTokenService();