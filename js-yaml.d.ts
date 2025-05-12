// Create this file at the root of your project: js-yaml.d.ts
declare module 'js-yaml' {
    export function load(input: string, options?: any): any;
    export function dump(obj: any, options?: any): string;
  }