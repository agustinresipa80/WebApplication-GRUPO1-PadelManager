<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <span class="login-icon">🎾</span>
        <h1>PadelManager</h1>
        <p>Creá tu cuenta para jugar</p>
      </div>

      <form class="login-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label>Nombre completo</label>
          <input v-model="form.name" type="text" placeholder="Juan Pérez" required :disabled="loading" />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="tu@email.com" required :disabled="loading" />
        </div>

        <div class="form-group">
          <label>Contraseña</label>
          <input v-model="form.password" type="password" placeholder="••••••••" required :disabled="loading" />
        </div>

        <div class="form-group">
          <label>Repetir contraseña</label>
          <input v-model="form.confirmPassword" type="password" placeholder="••••••••" required :disabled="loading" />
        </div>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading">Registrando...</span>
          <span v-else>Crear cuenta</span>
        </button>

        <p class="login-link">
          ¿Ya tenés cuenta? <RouterLink to="/login">Iniciá sesión</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router  = useRouter()
const API     = import.meta.env.VITE_API_URL

const form = reactive({
  name:            '',
  email:           '',
  password:        '',
  confirmPassword: ''
})

const loading    = ref(false)
const errorMsg   = ref('')
const successMsg = ref('')

async function handleRegister() {
  errorMsg.value   = ''
  successMsg.value = ''

  // Validaciones
  if (form.password !== form.confirmPassword) {
    errorMsg.value = 'Las contraseñas no coinciden.'
    return
  }

  if (form.password.length < 6) {
    errorMsg.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }

  loading.value = true

  try {
    // Verificar que el email no esté en uso
    const check = await fetch(`${API}/users?email=${encodeURIComponent(form.email)}`)
    const existing = await check.json()

    if (existing.length > 0) {
      errorMsg.value = 'Ya existe una cuenta con ese email.'
      return
    }

    // Crear el usuario
    const res = await fetch(`${API}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:     form.name,
        email:    form.email,
        password: form.password,
        role:     'player'
      })
    })

    if (!res.ok) throw new Error('Error al crear la cuenta')

    successMsg.value = '¡Cuenta creada! Redirigiendo al login...'
    setTimeout(() => router.push({ name: 'Login' }), 2000)

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
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-icon { font-size: 2.5rem; }

.login-header h1 {
  margin: 0.5rem 0 0.25rem;
  font-size: 1.8rem;
  color: var(--color-primary);
}

.login-header p { color: #666; font-size: 0.95rem; }

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group { display: flex; flex-direction: column; gap: 0.35rem; }

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

.form-group input:focus { border-color: var(--color-primary); }
.form-group input:disabled { background: #f5f5f5; }

.error-msg {
  background: #ffeaea;
  border: 1px solid #ffb3b3;
  color: #c0392b;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  font-size: 0.875rem;
}

.success-msg {
  background: #e8f5e9;
  border: 1px solid #a5d6a7;
  color: #2e7d32;
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
  transition: background 0.15s;
}

.btn-login:hover:not(:disabled) { background: #154f8a; }
.btn-login:disabled { opacity: 0.7; cursor: not-allowed; }

.login-link {
  text-align: center;
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.login-link a { color: var(--color-primary); font-weight: 600; }
</style>