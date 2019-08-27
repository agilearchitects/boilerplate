// Libs
import { Request, Response, Router } from "express";

// Types
import { dictionary } from "./server";

// Services
import { middlewareService } from "./services/middlewares.service";

// Controllers
import { authController } from "./controllers/auth.controller";

import "./modules/router.module";

export interface IResponse<T> extends Response {
  locals: T;
}

export interface IRequest<BODY = any, PARAMS extends dictionary<string> = any, QUERY extends dictionary<string | string[]> = any> extends Request {
  body: BODY;
  params: PARAMS;
  query: QUERY;
}

export const router = Router();

router.group("/auth", [], (router: Router) => {
  router.post("/login",
    authController.login
  );
  router.post("/register",
    middlewareService.reCaptchaToken, // Protect with recaptcha
    authController.register // Register new account
  );
  router.post("/request-reset-password",
    middlewareService.reCaptchaToken, // Protect with recaptcha
    authController.requestPasswordReset // Initiate a password reset (send email with reset link)
  );
  router.post("/reset-password",
    middlewareService.checkTokenBan, // Check that reset token is not banned
    authController.passwordReset // Call to reset password
  );
});

// Group all authenticated requests
router.group("", [
  middlewareService.checkTokenBan,
  middlewareService.isAuth
], (router: Router) => {
  return router;
});