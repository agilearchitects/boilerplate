export interface IBannedTokenDTO {
  token: string;
}

export class BannedTokenDTO {
  public static parse(bannedToken: IBannedTokenDTO): BannedTokenDTO {
    return new this(
      bannedToken.token,
    );
  }

  public constructor(
    public readonly token: string,
  ) { }

  public serialize(): IBannedTokenDTO {
    return {
      token: this.token,
    };
  }
}
