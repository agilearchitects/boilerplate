// Libs
import * as fs from "fs";

// Types
import { functionType } from "../server";

export type IEnv = { [key: string]: string };

export class EnvService {
  public constructor(
    private path: string = ".env",
    private readonly fsModule: typeof fs = fs,
  ) {
    // Set data
    this._data = this.readData(this.path);
    // initiate watcher which will updated envs on file change
    this.fsModule.watch(this.path, () => this._data = this.readData(this.path));
  }

  private _data: IEnv;

  /**
   * Read and return formated env file
   * @param path Path to read from
   * @return formated envs
   */
  private readData(path: string): IEnv {
    return this.fsModule.readFileSync(path, { encoding: "utf8", flag: "a+"}).split("\n").reduce((previousValue: string, currentValue: string) => {
      const split = currentValue.split("=");
      return Object.assign(previousValue, { [split[0]]: split[1] });
    }, {});
  }

  public get(name: string, defaultValue: string): string {
    return this._data[name] || defaultValue;
  }
}

export const envService: EnvService = new EnvService();
