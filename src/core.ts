import type { PiniaPluginContext, StateTree, Store } from 'pinia'
import type { Persistence, PersistenceOptions } from './types'

function hydrateStore(
  store: Store,
  { storage, serializer, key, debug, beforeHydrate, afterHydrate }: Persistence,
  runHooks = true,
) {
  try {
    if (runHooks)
      beforeHydrate?.(store)

    const fromStorage = storage.getItem(key)
    if (fromStorage)
      store.$patch(serializer.deserialize(fromStorage))

    if (runHooks)
      afterHydrate?.(store)
  }
  catch (error) {
    if (debug)
      console.error('[pinia-plugin-persistedstate]', error)
  }
}

function persistState(
  state: StateTree,
  { storage, serializer, key, debug, beforePersist, afterPersist }: Persistence,
  runHooks = true,
) {
  try {
    if (runHooks)
      beforePersist?.(state)

    const toStorage = serializer.serialize(state)
    storage.setItem(key, toStorage)

    if (runHooks)
      afterPersist?.(state)
  }
  catch (error) {
    if (debug)
      console.error('[pinia-plugin-persistedstate]', error)
  }
}

export function createPersistence(
  context: PiniaPluginContext,
  optionsParser: (p: PersistenceOptions) => Persistence,
  runWithContext: (fn: () => void) => void = fn => fn(),
) {
  const { store, options: { persist } } = context

  if (!persist)
    return

  const persistences = (
    Array.isArray(persist)
      ? persist
      : [typeof persist === 'boolean' ? {} : persist]
  ).map(optionsParser)

  store.$hydrate = ({ runHooks = true } = {}) => {
    persistences.forEach((p) => {
      runWithContext(() => hydrateStore(store, p, runHooks))
    })
  }

  store.$persist = ({ runHooks = true } = {}) => {
    persistences.forEach((p) => {
      runWithContext(() => persistState(store.$state, p, runHooks))
    })
  }

  persistences.forEach((p) => {
    runWithContext(() => hydrateStore(store, p))

    store.$subscribe(
      (_mutation, state) => runWithContext(() => persistState(state, p)),
      { detached: true },
    )
  })
}
