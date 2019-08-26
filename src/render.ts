import * as changeCase from "change-case";
import * as ejs from "ejs";
import * as fs from "fs";
import * as path from "path";
import * as yargs from "yargs";

const GENERATORS: { [key: string]: { templatePath: string, outputPath: string } } = {
  controller: {
    templatePath: "src/api/controllers/controller.ts.ejs",
    outputPath: "src/api/controllers/",
  },
  component: {
    templatePath: "src/spa/ts/components/component.vue.ejs",
    outputPath: "src/spa/ts/components/",
  },
  store: {
    templatePath: "src/spa/ts/store/store.ts.ejs",
    outputPath: "src/spa/ts/store/",
  },
  dto: {
    templatePath: "src/dto/dto.ts.ejs",
    outputPath: "src/dto/",
  }
};

const ENV_PATH = "./.env";
const ENV_EXAMPLE_PATH = "./.env.example";

const randomString = (length: number): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return new Array(length).fill("").map(() => chars[Math.floor(Math.random() * chars.length)]).join("");
};

yargs.command<{}>("generate <type> <name> [values...]", "Generate project file from tempalate",
  (yargs: yargs.Argv) => {
    return yargs.positional("type", {
      describe: "What template to render from",
    }).positional("name", {
      describe: "Under what name should the template be saved",
    });
  }, (args: any) => {
    const values: { [key: string]: string } = {};
    args.values.forEach((value: string, index: number) => {
      const parsedValue = value.split("=");
      if (parsedValue.length === 2) {
        values[parsedValue[0]] = parsedValue[1];
      } else {
        values[index] = value;
      }
    });
    let templatePath: string = "";
    let outputPath: string = "";
    Object.keys(GENERATORS).forEach((key: string) => {
      if (args.type === key) {
        templatePath = GENERATORS[key].templatePath;
        outputPath = GENERATORS[key].outputPath;
      }
    });
    // Render from template
    ejs.renderFile(templatePath, { changeCase, name: args.name, values }, (err: Error, str?: string) => {
      if (err) { console.error(err); return; } // tslint:disable-line:no-console
      // Create new file
      const split = templatePath.split("/");
      const match = split[split.length - 1].match(/(.*)\.(.+)\.ejs$/);
      let fileNamePostfix = "";
      let fileExtension = "ts";
      if (match !== null) {
        fileNamePostfix = match[1];
        fileExtension = match[2];
      }
      fs.writeFileSync(`${path.join(outputPath, changeCase.paramCase(args.name))}.${fileNamePostfix}.${fileExtension}`, str, "utf8");
    });
  }).command<{}>("init", "Initiate .env file", (args: any) => {
    if (!fs.existsSync(ENV_PATH) && fs.existsSync(ENV_EXAMPLE_PATH)) {
      let configs: { [key: string]: string } = {};
      configs = fs.readFileSync(ENV_EXAMPLE_PATH, "utf8").split("\n").reduce((out, value) => {
        const split = value.split("=");
        out[split[0]] = split[1];
        return out;
      }, configs);
      configs["TOKEN"] = randomString(40);
      configs["AUTH_KEY"] = randomString(10);
      configs["REFRESH_KEY"] = randomString(10);
      configs["ACTIVATION_KEY"] = randomString(10);
      configs["RESET_KEY"] = randomString(10);


      fs.writeFileSync(ENV_PATH, Object.keys(configs).map((key: string) => `${key}=${configs[key]}`).join("\n"), "utf8");
    } else if(fs.existsSync(ENV_PATH)) {

    }
  })
  .demandCommand().argv;
