import type { StateTree, Store } from 'pinia'
import type { Path } from 'deep-pick-omit'

export interface Storage {
  /**
   * Get a key's value if it exists.
   */
  getItem: (key: string) => string | null

  /**
   * Set a key with a value, or update it if it exists.
   */
  setItem: (key: string, value: string) => void
}

export interface Serializer {
  /**
   * Serialize state into string before storing.
   * @default JSON.stringify
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
   */
  serialize: (data: StateTree) => string

  /**
   * Deserializes string into state before hydrating.
   * @default destr
   * @see https://github.com/unjs/destr
   */
  deserialize: (data: string) => StateTree
}

export type Persistence<State extends StateTree = StateTree> = {
  /**
   * Storage key to use.
   * @default $store.id
   */
  key: string

  /**
   * Log errors in console.
   * @default false
   */
  debug?: boolean

  /**
   * Synchronous storage to persist the state.
   */
  storage: Storage

  /**
   * Serializer to serialize/deserialize state into storage.
   */
  serializer: Serializer

  /**
   * Hook called before hydrating store.
   */
  beforeHydrate?: (store: Store) => void

  /**
   * Hook called after hydrating store.
   */
  afterHydrate?: (store: Store) => void

  /**
   * Hook called before persisting state.
   */
  beforePersist?: (state: State) => void

  /**
   * Hook called after persisting state.
   */
  afterPersist?: (state: State) => void

  /**
   * Type-safe dot-notation paths to pick from state before persisting.
   */
  pick?: string[]
  /**
   * Type-safe dot-notation paths to omit from state before persisting.
   */
  omit?: string[]
  /**
   * Dot-notation paths to pick from state before persisting, prefer `pick` for type safety.
   * Will be ignored if `pick` is used at the same time.
   */
  unsafePick?: string[]
  /**
   * Dot-notation paths to omit from state before persisting, prefer `omit` for type safety.
   * Will be ignored if `omit` is used at the same time.
   */
  unsafeOmit?: string[]
} & {
  pick?: string[]
  omit?: string[]
}

export type PersistenceOptions<State extends StateTree = StateTree> = Partial<Persistence<State>> & {
  pick?: Path<State>[]
  omit?: Path<State>[]
}

declare module 'pinia' {
  // eslint-disable-next-line unused-imports/no-unused-vars
  export interface DefineStoreOptionsBase<S extends StateTree, Store> {
    /**
     * Persist store in storage
     * @see https://prazdevs.github.io/pinia-plugin-persistedstate
     */
    persist?: boolean | PersistenceOptions<S> | PersistenceOptions<S>[]
  }

  export interface PiniaCustomProperties {
    /**
     * Hydrate store from configured storage
     * Warning: this is for advances usecases, make sure you know what you're doing
     */
    $hydrate: (opts?: { runHooks?: boolean }) => void

    /**
     * Persist store into configured storage
     * Warning: this is for advances usecases, make sure you know what you're doing
     */
    $persist: (opts?: { runHooks?: boolean }) => void
  }
}
