import { deepOmitUnsafe, deepPickUnsafe } from 'deep-pick-omit'
import type { PiniaPluginContext, StateTree, Store, StoreGeneric } from 'pinia'
import type { Persistence, PersistenceOptions } from './types'

function hydrateStore(
  store: Store,
  {
    storage,
    serializer,
    key,
    debug,
    pick,
    omit,
    beforeHydrate,
    afterHydrate,
  }: Persistence,
  runHooks = true,
) {
  try {
    if (runHooks)
      beforeHydrate?.(store)

    const fromStorage = storage.getItem(key)
    if (fromStorage) {
      const deserialized = serializer.deserialize(fromStorage)
      const picked = pick
        ? deepPickUnsafe(deserialized, pick)

        : deserialized
      const omitted = omit
        ? deepOmitUnsafe(picked, omit)
        : picked
      store.$patch(omitted)
    }

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
  {
    storage,
    serializer,
    key,
    debug,
    pick,
    omit,
    beforePersist,
    afterPersist,
  }: Persistence,
  runHooks = true,
) {
  try {
    if (runHooks)
      beforePersist?.(state)

    const picked = pick
      ? deepPickUnsafe(state, pick)
      : state
    const omitted = omit
      ? deepOmitUnsafe(picked, omit)
      : picked
    const toStorage = serializer.serialize(omitted)
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
  const { pinia, store, options: { persist } } = context

  if (!persist)
    return

  // HMR handling, ignore stores created as 'hot' stores
  if (!(store.$id in pinia.state.value)) {
    // @ts-expect-error `_s` is a stripped @internal
    const originalStore: StoreGeneric = pinia._s.get(store.$id.replace('__hot:', ''))
    if (originalStore)
      Promise.resolve().then(() => originalStore.$persist())
    return
  }

  const persistenceOptions = Array.isArray(persist)
    ? persist
    : persist === true
      ? [{}]
      : [persist]

  const persistences = persistenceOptions.map(optionsParser)

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
