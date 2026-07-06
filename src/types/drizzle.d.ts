declare module 'drizzle-orm/node-postgres' {
  export function drizzle(...args: any[]): any;
}

declare module 'drizzle-orm/pg-core' {
  export function pgTable(...args: any[]): any;
  export function uuid(...args: any[]): any;
  export function text(...args: any[]): any;
  export function timestamp(...args: any[]): any;
  export function integer(...args: any[]): any;
  export function jsonb(...args: any[]): any;
}

declare module 'drizzle-orm' {
  export function eq(...args: any[]): any;
  export function and(...args: any[]): any;
  export function desc(...args: any[]): any;
}
