export interface IRefreshTokenDTO {
  token: string;
}

export class RefreshTokenDTO implements IRefreshTokenDTO {
  public static parse(refreshToken: IRefreshTokenDTO): RefreshTokenDTO {
    return new this(refreshToken.token);
  }

  private constructor(
    public readonly token: string,
  ) { }

  public serialize(): IRefreshTokenDTO {
    return {
      token: this.token,
    };
  }
}