// Libs
import { NextFunction, Request, Response } from "express";
import { IncomingHttpHeaders } from "http";

// Modules
import { LogModule } from "../modules/log.module";

// Services
import { UserDTO } from "../../dto/user.dto";
import { IResponse } from "../routes";
import { AuthService, authService as authServiceInstance } from "./auth.service";
import { ReCaptchaService, reCaptchaService as reCaptchaServiceInstance } from "./re-captcha.service";

export class MiddlewareService {
  public constructor(
    private readonly authService: AuthService = authServiceInstance,
    private readonly reCaptchaService: ReCaptchaService = reCaptchaServiceInstance,
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
   * Validates token against auth service
   */
  public token(request: Request, response: Response, next: NextFunction) {
    if(this.authService.validateToken(request.query.token)) {
      next();
    } else {
      this.insertLog("token", "Token validation failed", request.headers);
      response.sendStatus(403);
    }
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
