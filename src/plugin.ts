import { destr } from 'destr'
import type { PiniaPluginContext } from 'pinia'
import type { Persistence } from './types'
import { persist } from './core'

function createPersistedState() {
  return function (context: PiniaPluginContext) {
    persist(context, p => ({
      key: p.key ?? context.store.$id,
      serializer: p.serializer ?? {
        serialize: data => JSON.stringify(data),
        deserialize: data => destr(data),
      },
      storage: p.storage ?? window.localStorage,
    } satisfies Persistence))
  }
}

export default createPersistedState()
