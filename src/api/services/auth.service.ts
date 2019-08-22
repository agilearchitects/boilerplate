// DTO's
import { ILoginDTO } from "../../dto/login.dto";

// Modules
import { LogModule } from "../modules/log.module";

// Services
import { UserDTO } from "../../dto/user.dto";
import { config as configData, IConfig } from "./config.service";
import { EnvService, envService as envServiceInstance } from "./env.service";
import { HashService, hashService as hashServiceInstance } from "./hash.service";
import { JWTService, jwtService as jwtServiceInstance, tokenData } from "./jwt.service";
import { MailService, mailService as mailServiceInstance } from "./mail.service";
import { TemplateService, templateService as templateServiceInsance } from "./template.service";
import { UserService, userService as userServiceInstance } from "./user.service";

export type loginPayload = { token: string, user: UserDTO };
export type tokenPayload = { userId: number };
export type activationTokenPayload = { userId: number, isActivation: true };

export class AuthService {
  public constructor(
    private readonly userService: UserService = userServiceInstance,
    private readonly envService: EnvService = envServiceInstance,
    private readonly jwtService: JWTService = jwtServiceInstance,
    private readonly hashService: HashService = hashServiceInstance,
    private readonly mailService: MailService = mailServiceInstance,
    private readonly templateService: TemplateService = templateServiceInsance,
    private readonly log: LogModule = new LogModule("AuthService"),
    private readonly config: IConfig = configData,
    private readonly errorModule: typeof Error = Error,
  ) {}

  /**
   * Return corresponding user to provided JWT token
   * @param token Token to authorize with
   */
  public async auth(token: string): Promise<UserDTO> {
    try {
      // Get token data by decoding it
      const tokenData: tokenData<tokenPayload> = await this.jwtService.decode<{ userId: number}>(token);
      // Get user by id
      const user = await this.userService.getUserById(tokenData.payload.userId);
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
   * @param login login details
   */
  public async login(login: ILoginDTO): Promise<loginPayload> {
    try {
      // Get user
      const user = await this.userService.getUserByEmail(login.email);
      // Check provided password with users hashed password
      if (this.hashService.check(login.password, user.password)) {
        // Return token and user
        return {
          token: this.generateToken({ userId: user.id }),
          user: UserDTO.parse({
            id: user.id,
            email: user.email,
          })
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
   * Tries to validate token agains environment token.
   * Will only work in local env.
   * @param requestToken Token to validate
   */
  public validateToken(token: string): boolean {
    // Make sure to use random token to not resolve true if no token is present
    return this.envService.get("ENV", "") === "local" && this.envService.get("TOKEN", Math.random().toString()) === token;
  }

  /**
   * Generate a new JWT token
   * @param payload
   */
  public generateToken(payload: tokenPayload): string {
    return this.jwtService.sign(payload);
  }

  /**
   * Use refreshtoken to validate and return user data with a new token
   * @param token
   */
  public async refreshToken(token: string): Promise<loginPayload> {
    try {
      // Get user using refresh token
      const user = await this.auth(token);
      // Return user with new token
      return {
        token: this.generateToken({ userId: user.id }),
        user: UserDTO.parse({
          id: user.id,
          email: user.email,
        })
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
      const activationToken = this.jwtService.sign(
        { userId: user.id, activation: true },
        { expiresIn: "24h" });

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

  private logError(name: string, error?: any) {
    this.log.error({ title: name, message: "Something went wrong" }, error);
  }
}

export const authService = new AuthService();