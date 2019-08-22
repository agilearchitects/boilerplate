export interface IRegisterDTO {
  email: string;
  password: string;
}

export class RegisterDTO {
  public static parse(register: IRegisterDTO): RegisterDTO {
    return new this(
      register.email,
      register.password,
    );
  }

  public constructor(
    public readonly email: string,
    public readonly password: string,
  ) { }

  public serialize(): IRegisterDTO {
    return {
      email: this.email,
      password: this.password,
    };
  }
}
