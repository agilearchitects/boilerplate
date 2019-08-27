import { IAPIApp } from "simplyserveme";
import { router } from "./routes";
import { envService } from "./services/env.service";

export type functionType<T extends (...args: any) => any> = (...args: Parameters<T>) => ReturnType<T>;
export type dictionary<T> = { [key: string]: T };

export const app: IAPIApp = {
    domain: envService.get("API_HOST", "api.test.test"),
    corsConfig: "*",
    routes: router,
};