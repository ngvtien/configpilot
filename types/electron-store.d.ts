import type { Options } from "electron-store"

declare module "electron-store" {
  // This extends the existing electron-store module
  export default class Store<T extends Record<string, any>> {
    constructor(options?: Options<T>)

    // Get methods with proper typing for string keys
    get<K extends keyof T>(key: K): T[K]
    get<K extends keyof T, D>(key: K, defaultValue: D): T[K] | D
    get<K extends string, D = any>(key: K, defaultValue?: D): any
    get(): T

    // Set methods with proper typing for string keys
    set<K extends keyof T>(key: K, value: T[K]): void
    set<K extends string>(key: K, value: any): void
    set(object: Partial<T>): void

    // Other methods
    has<K extends keyof T | string>(key: K): boolean
    delete<K extends keyof T | string>(key: K): void
    clear(): void
    onDidChange<K extends keyof T | string>(key: K, callback: (newValue: any, oldValue: any) => void): () => void
    onDidAnyChange(callback: (newValue: T, oldValue: T) => void): () => void

    // Properties
    readonly path: string
    readonly store: T
    readonly size: number
  }

  export interface StoreType {
    get(key: string): any
    set(key: string, value: any): void
    // Add other methods as needed
  }
}
