import type { PiniaPluginContext } from 'pinia'
import type { Persistence, PersistenceOptions } from '../types'

export function persist(
  context: PiniaPluginContext,
  optionsParser: (p: Partial<PersistenceOptions>) => Persistence,
  runWithContext: (fn: () => void) => void = fn => fn(),
) {
  const { store, options: { persist } } = context

  if (!persist) {
    return
  }

  const persistences = (Array.isArray(persist) ? persist : [typeof persist === 'boolean' ? {} : persist]).map(optionsParser)

  persistences.forEach((p) => {
    const key = typeof p.key === 'string' ? p.key : p.key(store.$id)

    runWithContext(() => {
      const stored = p.storage.getItem(key)
      if (stored) {
        store.$patch(p.serializer.deserialize(stored))
      }
    })

    store.$subscribe((mutation, state) => {
      runWithContext(() => {
        const toStore = p.serializer.serialize(state)
        p.storage.setItem(key, toStore)
      })
    }, {
      detached: true,
    })
  })
}
