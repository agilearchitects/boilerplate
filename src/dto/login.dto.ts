export interface ILoginDTO {
  email: string;
  password: string;
  remember: boolean;
}

export class LoginDTO implements ILoginDTO {
  public static parse(login: ILoginDTO): LoginDTO {
    return new this(login.email, login.password, login.remember);
  }

  private constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly remember: boolean
  ) { }

  public serialize(): ILoginDTO {
    return {
      email: this.email,
      password: this.password,
      remember: this.remember
    };
  }
}