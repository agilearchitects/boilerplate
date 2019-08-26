export interface IRequestPasswordResetDTO {
  email: string;
}

export class RequestPasswordResetDTO {
  public static parse(requestPasswordReset: IRequestPasswordResetDTO): RequestPasswordResetDTO {
    return new this(
      requestPasswordReset.email,
    );
  }

  public constructor(
    public readonly email: string,
  ) { }

  public serialize(): IRequestPasswordResetDTO {
    return {
      email: this.email,
    };
  }
}
