// Libs
import { TransformableInfo } from "logform";
import * as momentModule from "moment";
import * as winstonModule from "winston";

// Services
import { config } from "../services/config.service";

enum logType {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error"
}

export class LogModule {
  private logger: winstonModule.Logger;

  public constructor(
    private readonly name: string,
    private readonly path: string = `${config.log.logPath}/${name}`,
    private readonly outputToConsole: boolean = config.log.outputToConsole,
    private readonly dateFormat: string = config.log.dateFormat,
    private readonly winston = winstonModule,
    private readonly moment = momentModule,
  ) {
    // Sets format for log output
    const format = [
      // add timestamp to output
      this.winston.format.timestamp(),
      // Format timestamp to nice date
      this.winston.format.printf((info: TransformableInfo) => `${this.moment(info.timestamp).format(this.dateFormat)} - ${info.level}: ${info.message}`),
    ];

    // Create logger item using winston
    this.logger = this.winston.createLogger({
      // Create transportations of logger
      transports: [
        ...(this.path !== undefined ? (() => {
          const matches = this.path.match(/^(.*\/)(.*)$/);
          // Transportation for saving to file
          return [new this.winston.transports.File({
            dirname: matches[1],
            filename: `${matches[2]}`,
            format: this.winston.format.combine(...format),
          })];
        })() : []),
        // Transportation for console output
        ...(this.outputToConsole ? [new this.winston.transports.Console({
          format: this.winston.format.combine(...[
            this.winston.format.colorize(),
            ...format,
          ]),
        })] : []),
      ],
    });
  }

  /**
   *
   * @param title Title of info
   * @param data Data to provide if any
   */
  public info(title: string, data?: any);
  /**
   *
   * @param info Title and message of info
   * @param data Data to provide if any
   */
  public info(info: { title: string, message: string }, data?: any);
  public info(info: { title: string, message: string } | string, data?: any) {
    if(typeof info === "string") {
      info = { title: info, message: undefined };
    }
    this.add(info.title, info.message, logType.INFO, data);
  }

  /**
   *
   * @param title Title of warning
   * @param data Data if any
   */
  public warning(title: string, data?: any);
  /**
   *
   * @param info Title and message of warning
   * @param data Data if any
   */
  public warning(info: { title: string, message: string }, data?: any);
  public warning(info: { title: string, message: string } | string, data?: any) {
    if(typeof info === "string") {
      info = { title: info, message: undefined };
    }
    this.add(info.title, info.message, logType.WARNING, data);
  }

  /**
   *
   * @param title Title of error
   * @param data Data if any
   */
  public error(title: string, data?: any);
  /**
   *
   * @param info Title and message of error
   * @param data Data if any
   */
  public error(info: { title: string, message: string }, data?: any);
  public error(info: { title: string, message: string } | string, data?: any) {
    if(typeof info === "string") {
      info = { title: info, message: undefined };
    }
    this.add(info.title, info.message, logType.ERROR, data);
  }

  private add(title: string, message: string, type: logType, data?: any) {
    this.logger.log({
      level: type,
      message: `${this.printMessage(title, message)}${data !== undefined ? ` - ${JSON.stringify(data)}` : ""}`
    });
  }

  private printMessage(title: string, message?: string) {
    return `${title}${message !== undefined ? `: "${message}"` : ``}`;
  }
}