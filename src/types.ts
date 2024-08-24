import type { StateTree } from 'pinia'

export interface Serializer {
  serialize: (data: StateTree) => string
  deserialize: (data: string) => StateTree
}

export interface Storage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export interface Persistence {
  key: string
  storage: Storage
  serializer: Serializer
}

declare module 'pinia' {
  // eslint-disable-next-line unused-imports/no-unused-vars
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: boolean | Partial<Persistence> | Partial<Persistence>[]
  }
}
