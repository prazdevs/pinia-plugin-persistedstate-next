import type { StateTree, Store } from 'pinia'

export interface Serializer {
  serialize: (data: StateTree) => string
  deserialize: (data: string) => StateTree
}

export interface Storage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export interface PersistenceOptions {
  key?: string | ((id: string) => string)
  storage?: Storage
  serializer?: Serializer
}

export interface Persistence {
  key: string | ((id: string) => string)
  storage: Storage
  serializer: Serializer
}

declare module 'pinia' {
  // eslint-disable-next-line unused-imports/no-unused-vars
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: boolean | Partial<PersistenceOptions> | Partial<PersistenceOptions>[]
  }
}
