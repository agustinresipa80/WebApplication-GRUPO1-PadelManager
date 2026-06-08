import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // ── Estado ──
  const user = ref(JSON.parse(localStorage.getItem('pm_user')) || null)

  // ── Getters ──
  const isLoggedIn = computed(() => !!user.value)
  const isAdmin    = computed(() => user.value?.role === 'admin')
  const userName   = computed(() => user.value?.name || '')

  // ── Acciones ──

  /**
   * Login contra MockAPI: busca un usuario con email y password.
   * MockAPI no tiene auth real, así que filtramos del lado cliente.
   */
  async function login(email, password) {
    console.log('URL:', import.meta.env.VITE_API_URL)
    const url = `${import.meta.env.VITE_API_URL}/users?email=${encodeURIComponent(email)}`
    const res  = await fetch(url)

    if (!res.ok) throw new Error('Error al conectar con el servidor')

    const users = await res.json()
    const found = users.find(u => u.password === password)

    if (!found) throw new Error('Email o contraseña incorrectos')

    user.value = found
    localStorage.setItem('pm_user', JSON.stringify(found))
  }

  function logout() {
    user.value = null
    localStorage.removeItem('pm_user')
  }

  return { user, isLoggedIn, isAdmin, userName, login, logout }
})
