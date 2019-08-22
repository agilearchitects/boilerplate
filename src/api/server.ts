export type functionType<T extends (...args: any) => any> = (...args: Parameters<T>) => ReturnType<T>;
export type dictionary<T> = { [key: string]: T };