export interface ILoginDTO {
  email: string;
  password: string;
}

export class LoginDTO implements ILoginDTO {
  public static parse(login: ILoginDTO): LoginDTO {
    return new this(login.email, login.password);
  }

  private constructor(
    public readonly email: string,
    public readonly password: string,
  ) { }

  public serialize(): ILoginDTO {
    return {
      email: this.email,
      password: this.password
    };
  }
}