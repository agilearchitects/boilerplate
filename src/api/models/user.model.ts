import { Column, Entity } from "typeorm";

import BaseModel from "./base.model";

export enum userStatus {

}

export interface IUserModel {
  id: number;
  email: string;
  password: string;
  active: Date | undefined;
  banned: Date | undefined;
}

@Entity()
export class UserModel extends BaseModel implements IUserModel {
  @Column({ unique: true })
  public email!: string;

  @Column()
  public password!: string;

  @Column({ type: Date, nullable: true })
  public active!: Date | undefined;

  @Column({ type: Date, nullable: true })
  public banned!: Date | undefined;
}