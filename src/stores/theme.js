import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const dark = ref(localStorage.getItem('pm_theme') === 'dark')

  function toggle() {
    dark.value = !dark.value
    localStorage.setItem('pm_theme', dark.value ? 'dark' : 'light')
    applyTheme()
  }

  function applyTheme() {
    document.documentElement.setAttribute(
      'data-theme',
      dark.value ? 'dark' : 'light'
    )
  }

  // Aplicar al iniciar
  applyTheme()

  return { dark, toggle }
})