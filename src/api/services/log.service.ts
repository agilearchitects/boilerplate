// Libs
import { TransformableInfo } from "logform";
import * as momentModule from "moment";
import * as winstonModule from "winston";

// Services
import { config } from "./config.service";

export class LogService {
  private logger: winstonModule.Logger;

  public constructor(
    private readonly outputToConsole: boolean = config.log.outputToConsole,
    private readonly path: string = config.log.logPath,
    private readonly dateFormat: string = config.log.dateFormat,
    private readonly winston = winstonModule,
    private readonly moment = momentModule,
  ) {
    const format = [
      this.winston.format.timestamp(),
      this.winston.format.printf((info: TransformableInfo) => `${moment(info.timestamp).format(this.dateFormat)} - ${info.level}: ${info.message}`),
    ];

    this.logger = this.winston.createLogger({
      transports: [
        ...(path !== undefined ? (() => {
          const matches = path.match(/^(.*\/)(.*)$/);

          return [new this.winston.transports.File({
            dirname: matches[1],
            filename: `${matches[2]}`,
            format: this.winston.format.combine(...format),
          })];
        })() : []),
        ...(outputToConsole ? [new this.winston.transports.Console({
          format: winston.format.combine(...[
            winston.format.colorize(),
            ...format,
          ]),
        })] : []),
      ],
    });
  }
}

export const logService: LogService = new LogService();