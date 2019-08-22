// Libs
import { NextFunction, Request, RequestHandler, Response } from "express";
import { ILoginDTO } from "../../dto/login.dto";
import { IRefreshTokenDTO } from "../../dto/refresh-token.dto";
import { IRegisterDTO } from "../../dto/register.dto";
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

  public requestResetPassword(request: Request, response: Response, next: NextFunction) {

  }

  public resetPassword(request: Request, response: Response, next: NextFunction) {

  }

  public register(request: IRequest<IRegisterDTO>, response: Response, next: NextFunction) {
    const registerData = request.body;
    this.authService.register(registerData.email, registerData.password).then(() =>
      response.sendStatus(200)
    ).catch(() =>
      response.sendStatus(400)
    );
  }
}

export const authController = new AuthController();
