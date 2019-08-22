export interface IUserDTO {
  id: number;
  email: string;
}

export class UserDTO {
  public static parse(user: IUserDTO): UserDTO {
    return new UserDTO(user.id, user.email);
  }

  private constructor(
    public readonly id: number,
    public readonly email: string,
  ) {}

  public serialize(): IUserDTO {
    return {
      id: this.id,
      email: this.email,
    };
  }
}