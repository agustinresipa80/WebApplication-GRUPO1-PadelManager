<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <RouterLink to="/">🎾 PadelManager</RouterLink>
    </div>

    <ul class="navbar-links">
      <!-- Links comunes (jugador y admin) -->
      <li><RouterLink to="/">Torneos</RouterLink></li>
      <li><RouterLink to="/perfil">Mi Perfil</RouterLink></li>

      <!-- Links exclusivos del admin -->
      <template v-if="authStore.isAdmin">
        <li class="divider"></li>
        <li><RouterLink to="/admin/dashboard">Dashboard</RouterLink></li>
        <li><RouterLink to="/admin/torneos">Gestión Torneos</RouterLink></li>
        <li><RouterLink to="/admin/jugadores">Jugadores</RouterLink></li>
        <li><RouterLink to="/admin/partidos">Partidos</RouterLink></li>
      </template>
    </ul>

    <div class="navbar-user">
      <span class="user-name">{{ authStore.userName }}</span>
      <span class="user-badge" :class="authStore.isAdmin ? 'badge-admin' : 'badge-player'">
        {{ authStore.isAdmin ? 'Admin' : 'Jugador' }}
      </span>
      <button class="btn-logout" @click="handleLogout">Salir</button>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router    = useRouter()

function handleLogout() {
  authStore.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0 2rem;
  height: 60px;
  background: var(--color-primary);
  color: white;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.navbar-brand a {
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
  white-space: nowrap;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
}

.navbar-links a {
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: background 0.15s, color 0.15s;
}

.navbar-links a:hover,
.navbar-links a.router-link-active {
  background: rgba(255,255,255,0.15);
  color: white;
}

.divider {
  width: 1px;
  height: 20px;
  background: rgba(255,255,255,0.3);
  margin: 0 0.5rem;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-left: auto;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 500;
}

.user-badge {
  font-size: 0.75rem;
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: 600;
}

.badge-admin  { background: #FFC107; color: #333; }
.badge-player { background: rgba(255,255,255,0.2); color: white; }

.btn-logout {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.15s;
}

.btn-logout:hover {
  background: rgba(255,255,255,0.25);
}
</style>
