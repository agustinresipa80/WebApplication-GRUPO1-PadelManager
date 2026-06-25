<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
  <svg width="80" height="80" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="95" fill="#1a3f7a"/>
    <circle cx="100" cy="100" r="90" fill="#1e4d96"/>
    <line x1="68" y1="55" x2="68" y2="155" stroke="white" stroke-width="18" stroke-linecap="round"/>
    <path d="M68 55 Q68 40 88 40 Q120 40 128 65 Q136 90 115 105 Q100 112 68 112" fill="none" stroke="white" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="118" cy="72" r="24" fill="#6aab28"/>
    <path d="M97 60 Q118 52 139 60" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M97 84 Q118 92 139 84" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="109" cy="63" r="6" fill="rgba(255,255,255,0.2)"/>
  </svg>
  <div class="brand-text-login">
    <span class="brand-padel-login">Padel</span><span class="brand-manager-login">Manager</span>
  </div>
  <p>Iniciá sesión para continuar</p>
</div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="tu@email.com"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            required
            :disabled="loading"
          />
        </div>

        <div v-if="errorMsg" class="error-msg">
          {{ errorMsg }}
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading">Ingresando...</span>
          <span v-else>Ingresar</span>
        </button>
          <p class="login-link">
            ¿No tenés cuenta? <RouterLink to="/register">Registrate</RouterLink>
          </p>
      </form>

      <!-- Ayuda para la demo -->
      <div class="demo-hint">
        <p><strong>Usuarios de prueba:</strong></p>
        <p>Admin: admin@padel.com / admin123</p>
        <p>Jugador: jugador@padel.com / jugador123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router    = useRouter()

const form = reactive({ email: '', password: '' })
const loading  = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''
  loading.value  = true

  try {
    await authStore.login(form.email, form.password)
    router.push({ name: 'Home' })
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary) 0%, #0d3b6e 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-icon {
  font-size: 2.5rem;
}

.login-header p {
  color: #666;
  font-size: 0.95rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
}

.form-group input {
  padding: 0.65rem 0.9rem;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.15s;
  outline: none;
}

.form-group input:focus {
  border-color: var(--color-primary);
}

.form-group input:disabled {
  background: #f5f5f5;
}

.error-msg {
  background: #ffeaea;
  border: 1px solid #ffb3b3;
  color: #c0392b;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  font-size: 0.875rem;
}

.btn-login {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}

.btn-login:hover:not(:disabled) {
  background: #154f8a;
  transform: translateY(-1px);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.demo-hint {
  margin-top: 1.5rem;
  padding: 0.75rem 1rem;
  background: #f0f7ff;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #555;
  line-height: 1.6;
}

.demo-hint strong {
  color: var(--color-primary);
}
.login-link {
  text-align: center;
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}
.login-link a { color: var(--color-primary); font-weight: 600; }
.login-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.brand-text-login {
  display: flex;
  justify-content: center;
  margin-bottom: 0.25rem;
}

.brand-padel-login {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.brand-manager-login {
  font-size: 2rem;
  font-weight: 400;
  color: #333;
}
</style>
