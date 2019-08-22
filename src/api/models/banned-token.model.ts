import { Column, Entity } from "typeorm";

import BaseModel from "./base.model";

export interface IBannedTokenModel {
  token: string;
}

@Entity()
export class BannedTokenModel extends BaseModel implements IBannedTokenModel {
  @Column()
  public token: string;
}