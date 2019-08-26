// Libs
import * as fs from "fs";

export interface IConfig {
  auth: {
    loginExpire: string,
    rememberExpire: string,
    activationExpire: string,
    resetPasswordExpire: string
  };
  email: {
    defaultFrom: string,
  };
  log: {
    logPath: string,
    outputToConsole: boolean,
    dateFormat: string,
  };
  recaptcha: {
    url: string
  };
  mailgun: {
    host: string
  };
}

export class ConfigService {
  public constructor(
    private readonly path: string = "boiler.config.json",
    private readonly fsModule: typeof fs = fs,
  ) {
    // Set data
    this._data = this.readData(this.path);
    // initiate watcher which will updated envs on file change
    this.fsModule.watch(this.path, () => this._data = this.readData(this.path));
  }

  private _data: IConfig;
  public get data(): IConfig { return this._data; }

  /**
   * Read and return formated env file
   * @param path Path to read from
   * @return formated envs
   */
  protected readData(path: string): IConfig {
    return JSON.parse((this.fsModule.readFileSync(path, { encoding: "utf8", flag: "a+"}) as string));
  }

}

export const configService: ConfigService = new ConfigService();
export const config: IConfig = configService.data;