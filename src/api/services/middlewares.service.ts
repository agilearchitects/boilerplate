// Libs
import { NextFunction, Request, Response } from "express";
import { IncomingHttpHeaders } from "http";

// Modules
import { LogModule } from "../modules/log.module";

// Services
import { UserDTO } from "../../dto/user.dto";
import { IRequest, IResponse } from "../routes";
import { AuthService, authService as authServiceInstance } from "./auth.service";
import { EnvService, envService as envServiceInstance } from "./env.service";
import { ReCaptchaService, reCaptchaService as reCaptchaServiceInstance } from "./re-captcha.service";

export class MiddlewareService {
  public constructor(
    private readonly authService: AuthService = authServiceInstance,
    private readonly reCaptchaService: ReCaptchaService = reCaptchaServiceInstance,
    private readonly envService: EnvService = envServiceInstance,
    private readonly errorModule: typeof Error = Error,
    private readonly log: LogModule = new LogModule("Middleware"),
  ) { }

  /**
   * Controlling user is authenticated before continue
   */
  public async isAuth(request: Request, response: IResponse<{ user: UserDTO }>, next: NextFunction): Promise<void> {
    // Check for authorization header
    if (request.headers.authorization) {
      // Extract token from header
      const token = (request.headers.authorization as string).substr(8, request.headers.authorization.length);
      try {
          response.locals = { user: await this.authService.auth(token) };
      } catch(error) {
        throw error;
    }
    } else {
      // Creates new error, logs it and throw
      const error = new this.errorModule("Authorization header missing from request");
      this.log.error({ title: "isAuth", message: error.message });
      throw error;
    }
  }

  /**
   * Tries to validate token agains environment token.
   * Will only work in local env.
   */
  public simpleToken(request: IRequest<any, any, { token: string }>, response: Response, next: NextFunction) {
    // Make sure to use random token to not resolve true if no token is present
    if(this.envService.get("ENV", "") === "local" && this.envService.get("TOKEN", Math.random().toString()) === request.query.token) {
      next();
    } else {
      response.sendStatus(403);
    }
  }

  public verifyJWTToken(request: IRequest<{ token: string }, any, { token: string }>, response: Response, next: NextFunction) {
    const token: string = request.method === "GET" ? request.query.token : request.body.token;
    this.authService.verifyToken(token).then(() => {
      next();
    }).catch(() => response.sendStatus(403));
  }

  /**
   * Validate google recaptcha token
   */
  public reCaptchaToken(request: Request, response: Response, next: NextFunction) {
    this.reCaptchaService
      .verify(request.headers.recaptcha.toString(), request.ip)
      .then(() => next())
      .catch(() => {
        this.insertLog("reCaptchaToken", "Validation for recpatcha failed", request.headers);
        response.sendStatus(403);
      });
  }

  public checkTokenBan(request: IRequest<{ token: string }, any, { token: string }>, response: Response, next: NextFunction) {
    const token: string = request.method === "GET" ? request.query.token : request.body.token;
    this.authService.isTokenBanned(token).then((isBanned: boolean) => {
      if(isBanned) {
        next();
      } else {
        response.sendStatus(403);
      }
    }).catch(() => {
      this.insertLog("checkTokenBan", "Failed to check token ban", request.headers);
      response.sendStatus(500);
    });
  }

  /**
   * Shorthand method for logging
   * @param title Log titlt
   * @param message  Log message
   * @param headers Request header that will be added to log data
   */
  private insertLog(title: string, message: string, headers: IncomingHttpHeaders) {
    this.log.info({ title, message }, { headers });
  }
}

export const middlewareService = new MiddlewareService();
