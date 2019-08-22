import { NextFunction, Request, Response, Router } from "express";
import { UserDTO } from "../dto/user.dto";
import { authController } from "./controllers/auth.controller";
import { dictionary } from "./server";
import { middlewareService } from "./services/middlewares.service";
import { routerService } from "./services/router.service";

export interface IResponse<T> extends Response {
  locals: T;
}

export interface IRequest<BODY = any, PARAMS extends dictionary<string> = any, QUERY extends dictionary<string | string[]> = any> extends Request {
  body: BODY;
  params: PARAMS;
  query: QUERY;
}

const router = Router();

routerService.group(router, "/auth", [], (router: Router) => {
  router.post("/login",
    authController.login
  );
  router.post("/register",
    middlewareService.reCaptchaToken,
    authController.register
  );
  return router;
});

// Group all authenticated requests
routerService.group(router, "", [middlewareService.isAuth], (router: Router) => {
  return router;
});