// Libs
import { NextFunction, Request, RequestHandler, Response } from "express";
import { ILoginDTO } from "../../dto/login.dto";
import { IPasswordResetDTO } from "../../dto/password-reset.dto";
import { IRefreshTokenDTO } from "../../dto/refresh-token.dto";
import { IRegisterDTO } from "../../dto/register.dto";
import { IRequestPasswordResetDTO } from "../../dto/request-password-reset.dto";
import { LogModule } from "../modules/log.module";
import { IRequest } from "../routes";
import { AuthService, authService as authServiceInstance, loginPayload } from "../services/auth.service";

export class AuthController {
  public constructor(
    private readonly authService: AuthService = authServiceInstance,
    private readonly log: LogModule = new LogModule("AuthController")
  ) {}

  public login(request: Request, response: Response, next: NextFunction) {
    // Get login data
    const login: ILoginDTO = request.body;

    // Use auth server to attempt login. Will send JWT token and user if successful
    this.authService.login(login).then((payload: loginPayload) => response.json({
      token: payload.token,
      user: payload.user.serialize()
    })).catch((error: any) => {
      // Log error
      this.log.error({ title: "login", message: "something went wrong" }, error);
      // Response with 403
      response.sendStatus(403);
    });
  }

  public refreshToken(request: IRequest<IRefreshTokenDTO>, response: Response, next: NextFunction) {
    // Get refresh token from request
    const token: string = request.body.token;

    // Trying to refresh token
    this.authService.refreshToken(token).then((payload: loginPayload) => response.json({
      token: payload.token,
      user: payload.user.serialize()
    })).catch((error) => {
      // Log error
      this.log.error({ title: "refreshToken", message: "something went wrong" }, error);
      // Response with 403
      response.sendStatus(403);
    });
  }

  public async requestPasswordReset(request: IRequest<IRequestPasswordResetDTO>, response: Response, next: NextFunction) {
    const requestPasswordReset: IRequestPasswordResetDTO = request.body;
    try {
      await this.authService.requestResetPassword(requestPasswordReset.email);
    } finally {
      response.sendStatus(200);
    }
  }

  public passwordReset(request: IRequest<IPasswordResetDTO>, response: Response, next: NextFunction) {
    const passwordReset: IPasswordResetDTO = request.body;
    try {
      this.authService.resetPassword(passwordReset.token, passwordReset.password);
      response.sendStatus(200);
    } catch {
      response.sendStatus(500);
    }
  }

  public register(request: IRequest<IRegisterDTO>, response: Response, next: NextFunction) {
    const register: IRegisterDTO = request.body;
    this.authService.register(register.email, register.password).then(() =>
      response.sendStatus(200)
    ).catch(() =>
      response.sendStatus(400)
    );
  }
}

export const authController = new AuthController();
