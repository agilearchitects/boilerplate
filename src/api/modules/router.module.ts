import { RequestHandler, Router } from "express";
import * as express from "express";
import { PathParams } from "express-serve-static-core";

type groupCall = (prefix: PathParams, middlewares: RequestHandler[], group: (router: Router) => void) => void;

// Add group to Router interface
declare module "express-serve-static-core" {
  export interface Router { // tslint:disable-line:interface-name
    group: groupCall;
  }
}

const oldRouter = express.Router;
// @ts-ignore
Router = (...args: any[]) => {
  const router = oldRouter(...args);
  router.group = function (prefix, middlewares, group) { // tslint:disable-line:only-arrow-functions
    const router = Router({ mergeParams: true });
    group(router);
    this.use(prefix, middlewares, router);
  };
  return router;
};
