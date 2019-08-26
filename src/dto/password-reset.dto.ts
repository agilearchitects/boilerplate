export interface IPasswordResetDTO {
  token: string;
  password: string;
}

export class PasswordResetDTO {
  public static parse(passwordReset: IPasswordResetDTO): PasswordResetDTO {
    return new this(
      passwordReset.token,
      passwordReset.password,
    );
  }

  public constructor(
    public readonly token: string,
    public readonly password: string,
  ) { }

  public serialize(): IPasswordResetDTO {
    return {
      token: this.token,
      password: this.password,
    };
  }
}
