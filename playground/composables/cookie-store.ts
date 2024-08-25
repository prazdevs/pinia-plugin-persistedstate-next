export const useCookieStore = defineStore('cookie', () => {
  const username = ref('prazdevs')
  const something = ref({ wow: 'test', testing: ['f'] })

  return { username, something }
}, {
  persist: {
    storage: piniaPluginPersistedstate.cookies,
  },
})
