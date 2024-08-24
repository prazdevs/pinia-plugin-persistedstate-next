<script setup lang="ts">
const cookieStore = useCookieStore()
</script>

<template>
  <main>
    <label>
      {{ cookieStore.$id }}
      <input v-model="cookieStore.username">
    </label>
  </main>
</template>
