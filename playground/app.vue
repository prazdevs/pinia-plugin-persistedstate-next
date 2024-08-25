<script setup lang="ts">
import { defu, defuFn } from 'defu'

const cookieStore = useCookieStore()

const options = defu({ key: (s: string) => `prepended${s}` }, { key: 'wow' })
</script>

<template>
  <main>
    {{ options }}
    <label>
      {{ cookieStore.$id }}
      <input v-model="cookieStore.username">
    </label>
  </main>
</template>
