export type json = string | number | boolean | null | { [key: string]: json } | ({ [key: string]: json })[] | (string | number | boolean | null)[];
export type jsonObject = { [key: string]: json };

export type env = string;
export type envObject = { [key: string]: env };
export enum parseType {
  ENV = "env",
  JSON = "json"
}

export const parser = <T extends json & env>(value: string, type: parseType): { [key: string]: T } => {
  if(type === parseType.JSON) {
    return JSON.parse(value);
  } else if(type === parseType.ENV) {
    return value.split("\n").map((row: string) => row.split("="))
      .reduce((
          previousValue: {},
          currentValue: string[]
        ) => Object.assign(previousValue, { [currentValue[0]]: currentValue[1] || "" })
      , {});
  }
};
