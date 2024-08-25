import type { PiniaPluginContext } from 'pinia'
import { destr } from 'destr'
import { createPersistence } from './core'

function createPersistedState() {
  return function (context: PiniaPluginContext) {
    createPersistence(context, p => ({
      key: p.key ?? context.store.$id,
      debug: p.debug,
      serializer: p.serializer ?? {
        serialize: data => JSON.stringify(data),
        deserialize: data => destr(data),
      },
      storage: p.storage ?? window.localStorage,
    }))
  }
}

/**
 * Pinia plugin to persist stores.
 * @see https://prazdevs.github.io/pinia-plugin-persistedstate/
 */
const piniaPluginPersistedstate = createPersistedState()

export { type Persistence, type PersistenceOptions } from './types'

export default piniaPluginPersistedstate
