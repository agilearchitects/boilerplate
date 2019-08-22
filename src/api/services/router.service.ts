import { RequestHandler, Router } from "express";

export class RouterService {
  public constructor(
    private readonly router: typeof Router = Router,
  ) { }

  public group(router: Router, prefix: string, handlers: RequestHandler[] | RequestHandler, cb: (router: Router) => Router): Router {
    // Attach
    return router.use(prefix, handlers, cb(this.router({ mergeParams: true })));
  }
}

export const routerService = new RouterService();