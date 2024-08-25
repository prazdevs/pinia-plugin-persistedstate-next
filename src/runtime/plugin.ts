import { destr } from 'destr'
import type { Pinia, PiniaPluginContext } from 'pinia'
import type { Persistence } from '../types'
import { persist } from '../core'
import { storages } from './storages'
import { defineNuxtPlugin, useNuxtApp } from '#app'

function piniaPlugin(context: PiniaPluginContext) {
  const nuxtApp = useNuxtApp()

  persist(context, p => ({
    key: p.key ?? context.store.$id,
    serializer: p.serializer ?? {
      serialize: data => JSON.stringify(data),
      deserialize: data => destr(data),
    },
    storage: p.storage ?? storages.cookies,
  } satisfies Persistence), nuxtApp.runWithContext)
}

export default defineNuxtPlugin(({ $pinia }) => {
  ($pinia as Pinia).use(piniaPlugin)
})
