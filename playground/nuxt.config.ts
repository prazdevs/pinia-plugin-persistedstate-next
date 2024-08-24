export default defineNuxtConfig({
  compatibilityDate: {
    default: '2024-08-24'
  },
  devtools: {
    enabled: true
  },
  modules: [
    '@pinia/nuxt',
    '../src/module'
  ],
})
