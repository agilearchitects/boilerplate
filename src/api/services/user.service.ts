// Models
import { IUserModel, UserModel } from "../models/user.model";

// Modules
import { LogModule } from "../modules/log.module";

// DTO's
import * as typeorm from "typeorm";
import { UserDTO } from "../../dto/user.dto";

export class UserService {
  public constructor(
    private readonly userModel: typeof UserModel = UserModel,
    private readonly errorModule: typeof Error = Error,
    private readonly typeormModule: typeof typeorm = typeorm,
    private readonly log: LogModule = new LogModule("userService"),
  ) { }

  /**
   * Getting user by id
   * @param id Id to search for
   */
  public async getUserById(id: number): Promise<IUserModel> {
    return this.getUserBy(id, true, false);
  }

  /**
   * Getting user by email
   * @param email Email to search for
   */
  public async getUserByEmail(email: string): Promise<IUserModel> {
    return this.getUserBy(email, true, false);
  }

  /**
   * Get user by either id or email
   * @param value number or string depending on getting by id or getting by email,
   * @param isActive Get only active users (true), inactive users (false) or all users (null)
   * @param isBanned Get only banned users (true), unbanned users (false) or all users (null)
   */
  private async getUserBy(
    value: number | string,
    isActive: boolean | null,
    isBanned: boolean | null,
  ): Promise<IUserModel> {
    const type: "id" | "email" = typeof value === "number" ? "id" : "email";

    try {
      // Get user
      const user: UserModel | undefined = await this.userModel.findOne({
        where: {
          ...(type === "id" ? { id: value } : { email: value }),
          ...(typeof isActive === "boolean" ? { active: isActive ? this.typeormModule.Not(this.typeormModule.IsNull()) : this.typeormModule.IsNull() } : undefined ),
          ...(typeof isBanned === "boolean" ? { banned: isBanned ? this.typeormModule.Not(this.typeormModule.IsNull()) : this.typeormModule.IsNull() } : undefined ),
        }
      });

      // If no user was found
      if(user === undefined) {
        const error = new this.errorModule(`Unable to find user by ${type === "id" ? "id" : "email"}`);
        this.log.info({ title: `getUserBy${type === "id" ? "Id" : "Email"}`, message: error.message });
        throw error;
      }

      // Return data
      return {
        id: user.id,
        email: user.email,
        password: user.password,
        active: user.active,
        banned: user.banned
      };
    // Throw error if fail
    } catch(error) {
      this.log.error({ title: `getUserBy${type === "id" ? "Id" : "Email"}`, message: "Something went wrong" }, error);
      throw error;
    }
  }

  public async create(email: string, password: string): Promise<UserDTO> {
    try {
      const user = await this.userModel.create({ email, password });
      return UserDTO.parse({
        id: user.id,
        email: user.email,
      });
    } catch(error) {
      this.log.error({ title: "create", message: "Something went wrong" }, error);
      throw error;
    }
  }

  public async activateUser(email: string): Promise<void> {
    try {
      // Get none active user (not banned)
      const user = await this.getUserBy(email, false, false);
      // Updated to set user active
      await this.userModel.update(user.id, { active: new Date() });
      return;
    } catch(error) {
      this.logError("activateUser", error);
      throw(error);
    }
  }

  public async deActivateUser(email: string): Promise<void> {
    try {
      // Get none active user (not banned)
      const user = await this.getUserBy(email, false, false);
      // Updated to set user active
      await this.userModel.update(user.id, { active: null });
      return;
    } catch(error) {
      this.logError("activateUser", error);
      throw(error);
    }
  }

  public async banUser(email: string): Promise<void> {
    try {
      // Get none active user (not banned)
      const user = await this.getUserBy(email, false, false);
      // Updated to set user active
      await this.userModel.update(user.id, { banned: new Date() });
      return;
    } catch(error) {
      this.logError("activateUser", error);
      throw(error);
    }
  }

  public async unbanUser(email: string): Promise<void> {
    try {
      // Get none active user (not banned)
      const user = await this.getUserBy(email, false, false);
      // Updated to set user active
      await this.userModel.update(user.id, { banned: null });
      return;
    } catch(error) {
      this.logError("activateUser", error);
      throw(error);
    }
  }

  private logError(name: string, error?: any) {
    this.log.error({ title: name, message: "Something went wrong" }, error);
  }
}

export const userService = new UserService();