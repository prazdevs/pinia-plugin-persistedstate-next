import type { Pinia, PiniaPluginContext } from 'pinia'
import { destr } from 'destr'
import { defu } from 'defu'
import type { Persistence } from '../types'
import { storages } from './storages'
import { defineNuxtPlugin, useNuxtApp } from '#app'

function piniaPlugin({ store, options: { persist } }: PiniaPluginContext) {
  const nuxtApp = useNuxtApp()

  if (!persist) {
    return
  }

  const persistences = (Array.isArray(persist) ? persist : [persist]).map(p => defu(p, {
    key: store.$id,
    serializer: {
      serialize: data => JSON.stringify(data),
      deserialize: data => destr(data),
    },
    storage: storages.cookies,
  } satisfies Persistence))

  persistences.forEach((p) => {
    nuxtApp.runWithContext(() => {
      const stored = p.storage.getItem(p.key)
      if (stored) {
        store.$patch(p.serializer.deserialize(stored))
      }
    })

    store.$subscribe((mutation, state) => {
      nuxtApp.runWithContext(() => {
        const toStore = p.serializer.serialize(state)
        p.storage.setItem(p.key, toStore)
      })
    }, {
      detached: true,
    })
  })
}

export default defineNuxtPlugin(({ $pinia }) => {
  ($pinia as Pinia).use(piniaPlugin)
})
