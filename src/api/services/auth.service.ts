// DTO's
import { ILoginDTO } from "../../dto/login.dto";
import { UserDTO } from "../../dto/user.dto";

// Modules
import { LogModule } from "../modules/log.module";

// Services
import { BannedTokenService, bannedTokenService as bannedTokenServiceInstance } from "./banned-token.service";
import { config as configData, IConfig } from "./config.service";
import { EnvService, envService as envServiceInstance } from "./env.service";
import { HashService, hashService as hashServiceInstance } from "./hash.service";
import { JWTService, jwtService as jwtServiceInstance, tokenData } from "./jwt.service";
import { MailService, mailService as mailServiceInstance } from "./mail.service";
import { TemplateService, templateService as templateServiceInsance } from "./template.service";
import { UserService, userService as userServiceInstance } from "./user.service";

export type loginPayload = { token: string, user: UserDTO, refreshToken?: string };
export type authTokenPayload = { authUserWithId: number };
export type refreshTokenPayload = { refreshUserWithId: number };
export type activationTokenPayload = { activateUserWithId: number };
export type resetPasswordTokenPayload = { resetAccountWithid: number };
export enum tokenType {
  AUTH = "auth",
  REFRESH = "refresh",
  ACTIVATION = "activation",
  RESET = "reset",
}

export class AuthService {
  public constructor(
    private readonly userService: UserService = userServiceInstance,
    private readonly bannedTokenService: BannedTokenService = bannedTokenServiceInstance,
    private readonly envService: EnvService = envServiceInstance,
    private readonly jwtService: JWTService = jwtServiceInstance,
    private readonly hashService: HashService = hashServiceInstance,
    private readonly mailService: MailService = mailServiceInstance,
    private readonly templateService: TemplateService = templateServiceInsance,
    private readonly authKey: string = envService.get("AUTH_KEY", Math.random().toString()),
    private readonly refereshKey: string = envService.get("REFRESH_KEY", Math.random().toString()),
    private readonly activationKey: string = envService.get("ACTIVATION_KEY", Math.random().toString()),
    private readonly resetKey: string = envService.get("RESET_KEY", Math.random().toString()),
    private readonly log: LogModule = new LogModule("AuthService"),
    private readonly config: IConfig = configData,
    private readonly errorModule: typeof Error = Error,
  ) { }

  /**
   * Authorize using JWT token
   * @param token Token to authorize with
   */
  public async auth(token: string): Promise<UserDTO> {
    try {
      // Get token data by decoding it
      const tokenData: tokenData<authTokenPayload> = await this.jwtService.decode<authTokenPayload>(token, this.authKey);
      // Get user by id
      const user = await this.userService.getUserById(tokenData.payload.authUserWithId);
      // Return user
      return UserDTO.parse({
        id: user.id,
        email: user.email
      });
    } catch(error) {
      // Error while decoding or getting user. Log and throw error
      this.logError("auth", error);
      throw error;
    }
  }

  /**
   * Login by checking email and verify password agains user model
   * Will return an auth token that can be used with the "auth"-method
   * @param login login details
   */
  public async login(login: ILoginDTO): Promise<loginPayload> {
    try {
      // Get user
      const user = await this.userService.getUserByEmail(login.email);
      // Check provided password with users hashed password
      if (this.hashService.check(login.password, user.password)) {
        // Return new token and user
        return {
          token: this.jwtService.sign<authTokenPayload>(
            { authUserWithId: user.id },
            this.authKey,
            this.config.auth.loginExpire
          ),
          user: UserDTO.parse({
            id: user.id,
            email: user.email,
          }),
          // If login was set to remember user a refresh token is provided as well
          ...(login.remember ? {
              refreshToken: this.jwtService.sign<refreshTokenPayload>(
                { refreshUserWithId: user.id },
                this.refereshKey,
                this.config.auth.rememberExpire
              ) } : undefined)
        };
      }
      // Create error
      const error = new this.errorModule(`Password hash check failed for user ${user.id}`);
      // Log error as info message
      this.log.info({ title: "login", message: error.message });
      // Throw error
      throw error;
    } catch(error) {
        // Something more serious happend. Log as error and throw
        this.logError("login", error);
       throw(error);
      }
  }

  /**
   * Use refreshtoken to validate and return user data with a new token
   * @param token
   */
  public async refreshToken(token: string): Promise<loginPayload> {
    try {
      // Get user using refresh token
      const user = await this.auth(token);
      // Return user with new token and refresh token
      return {
        token: this.jwtService.sign<authTokenPayload>(
          { authUserWithId: user.id },
          this.authKey,
          this.config.auth.loginExpire,
        ),
        user: UserDTO.parse({
          id: user.id,
          email: user.email,
        }),
        refreshToken: this.jwtService.sign<refreshTokenPayload>(
          { refreshUserWithId: user.id },
          this.refereshKey,
          this.config.auth.rememberExpire,
        ),
      };
    } catch (error) {
      this.logError("refereshToken", error);
    }
  }

  public async register(email: string, password: string): Promise<void> {
    try {
      // Create user
      const user: UserDTO = await this.userService.create(
        email,
        this.hashService.create(password),
      );

      // Create activation token vaild for 24h
      const activationToken = this.jwtService.sign<activationTokenPayload>(
        { activateUserWithId: user.id },
        this.activationKey,
        this.config.auth.activationExpire,
      );

      // Get register email template
      const emailTemplate = await this.templateService.email("register", { token: activationToken });

      // Send email
      await this.mailService.send(this.config.email.defaultFrom, email, emailTemplate.subject, emailTemplate.message);

      return;
    } catch(error) {
      this.logError("register", error);
      throw(error);
    }
  }

  public async activateAccount(token: string): Promise<void> {
    try {
      // Get data from provided token
      const tokenData = await this.jwtService.decode<activationTokenPayload>(token, this.activationKey);
      return this.userService.activateUser(tokenData.payload.activateUserWithId);
    } catch (error) {
      this.logError("activateAccount", error);
      throw error;
    }
  }

  public async requestResetPassword(email: string): Promise<void> {
    try {
      // Get user (active or not) by provided email
      const user = await this.userService.getUserByEmail(email, null, false);

      // Create token
      const resetToken = await this.jwtService.sign<resetPasswordTokenPayload>(
        { resetAccountWithid: user.id },
        this.resetKey,
        this.config.auth.resetPasswordExpire
      );

      // Get reset password email template
      const emailTemplate = await this.templateService.email("reset_password", { token: resetToken });

      // Send email
      await this.mailService.send(this.config.email.defaultFrom, user.email, emailTemplate.subject, emailTemplate.message);

      return;
    } catch(error) {
      this.logError("requestResetPassword", error);
      throw error;
    }
  }

  public async resetPassword(token: string, password: string): Promise<void> {
    try {
      // Get token data
      const tokenData = await this.jwtService.decode<resetPasswordTokenPayload>(token, this.resetKey);

      // Get user active or not active (doesn't matter)
      const user = await this.userService.getUserById(tokenData.payload.resetAccountWithid, null, false);

      // Update password
      await this.userService.resetPassword(user.id, this.hashService.create(password));

      return;
    } catch(error) {
      this.logError("resetAccount", error);
      throw error;
    }
  }

  public async verifyToken(token: string, type?: tokenType): Promise<boolean> {
    try {
      let key: string;
      switch(type) {
        case tokenType.AUTH:
          key = this.authKey;
          break;
        case tokenType.REFRESH:
          key = this.refereshKey;
          break;
        case tokenType.ACTIVATION:
          key = this.activationKey;
          break;
        case tokenType.RESET:
          key = this.resetKey;
          break;
      }

      if(key === undefined) {
        let verified: boolean = false;
        for(let a = 0; a < Object.keys(tokenType).length; a++) {
          try {
            await this.verifyToken(token, tokenType[Object.keys(tokenType)[a]]);
            verified = true;
          } finally {}
        }
        if(verified) {
          return true;
        } else {
          return false;
        }
      } else {
        await this.jwtService.decode(token, key);
        return true;
      }

    } catch(error) {
      this.logError("verifyToken", error);
      return false;
    }
  }

  public async isTokenBanned(token: string): Promise<boolean> {
    try {
      return await this.bannedTokenService.get(token) !== undefined;
    } catch(error) {
      this.log.error({ title: "isBanned", message: "Something went wrong" }, error);
      throw error;
    }
  }

  private logError(name: string, error?: any) {
    this.log.error({ title: name, message: "Something went wrong" }, error);
  }
}

export const authService = new AuthService();