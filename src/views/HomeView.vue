<template>
  <div class="page">
    <div class="page-header">
      <!-- Notificación de bienvenida -->
    <div v-if="!authStore.isAdmin && bienvenida" class="bienvenida" :class="bienvenida.tipo">
      <span class="bienvenida-icono">{{ bienvenida.icono }}</span>
      <div>
        <strong>{{ bienvenida.titulo }}</strong>
        <p>{{ bienvenida.mensaje }}</p>
      </div>
      <button class="bienvenida-close" @click="bienvenida = null">✕</button>
    </div>
      <h1>Torneos</h1>
      <p class="subtitle">Consultá los torneos activos y próximos</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-msg">Cargando torneos...</div>

    <!-- Error -->
    <div v-else-if="error" class="state-msg error">{{ error }}</div>

    <!-- Sin torneos -->
    <div v-else-if="torneos.length === 0" class="state-msg">
      No hay torneos disponibles por el momento.
    </div>

    <!-- Lista -->
    <div v-else class="torneos-grid">
      <div
        v-for="torneo in torneos"
        :key="torneo.id"
        class="torneo-card"
      >
        <div class="torneo-header">
          <span class="torneo-categoria">{{ torneo.category }}</span>
          <span class="torneo-status" :class="`status-${torneo.status}`">
            {{ statusLabel(torneo.status) }}
          </span>
        </div>
        <h2 class="torneo-nombre">{{ torneo.name }}</h2>
        <div class="torneo-info">
          <span>📅 {{ formatDate(torneo.date) }}</span>
          <span>🏆 {{ torneo.prize }}</span>
          <span>👥 {{ torneo.maxPairs }} parejas</span>
        </div>
        <RouterLink
          v-if="torneo.status === 'active'"
          :to="`/torneo/${torneo.id}/fixture`"
          class="btn-ver-fixture"
        >
          Ver fixture →
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const API = import.meta.env.VITE_API_URL

const torneos    = ref([])
const loading    = ref(true)
const error      = ref('')
const bienvenida = ref(null)

async function fetchTorneos() {
  try {
    const res = await fetch(`${API}/tournaments`)
    if (!res.ok) throw new Error('No se pudieron cargar los torneos')
    torneos.value = await res.json()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function cargarBienvenida() {
  if (authStore.isAdmin) return

  const user = authStore.user
  const nombre = user?.name?.split(' ')[0] || 'jugador'

  try {
    const res = await fetch(`${API}/players`)
    const players = await res.json()

    const miPareja = players.find(p =>
      p.user1Id === user?.id || p.user2Id === user?.id
    )

    if (miPareja) {
      const resTorneo = await fetch(`${API}/tournaments/${miPareja.tournamentId}`)
      const torneo = await resTorneo.json()
      bienvenida.value = {
        tipo:    'info',
        icono:   '🎾',
        titulo:  `¡Bienvenido, ${nombre}!`,
        mensaje: `Estás inscripto en el torneo "${torneo.name}" — ${torneo.category} categoría.`
      }
    } else {
      bienvenida.value = {
        tipo:    'warning',
        icono:   '👋',
        titulo:  `¡Hola, ${nombre}!`,
        mensaje: 'Todavía no estás inscripto en ningún torneo. Contactá al administrador para inscribirte.'
      }
    }
  } catch {
    // Si falla, no mostramos nada
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function statusLabel(status) {
  const map = { draft: 'Borrador', active: 'Activo', finished: 'Finalizado' }
  return map[status] || status
}

onMounted(() => {
  fetchTorneos()
  cargarBienvenida()
})
</script>

<style scoped>
.page { padding: 2rem; max-width: 1100px; margin: 0 auto; }

.page-header { margin-bottom: 2rem; }
.page-header h1 { font-size: 1.8rem; color: var(--color-primary); margin: 0 0 0.25rem; }
.subtitle { color: #666; margin: 0; }

.state-msg { text-align: center; padding: 3rem; color: #888; font-size: 1rem; }
.state-msg.error { color: #c0392b; }

.torneos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

.torneo-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: box-shadow 0.2s;
}

.torneo-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }

.torneo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.torneo-categoria {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary);
  background: #e8f0fb;
  padding: 2px 10px;
  border-radius: 12px;
}

.torneo-status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 12px;
}
.status-active   { background: #e8f5e9; color: #2e7d32; }
.status-draft    { background: #fff3e0; color: #e65100; }
.status-finished { background: #f3f4f6; color: #666; }

.torneo-nombre { margin: 0; font-size: 1.1rem; color: #1a1a1a; }

.torneo-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.875rem;
  color: #555;
}

.btn-ver-fixture {
  margin-top: auto;
  text-align: center;
  padding: 0.5rem;
  background: var(--color-primary);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  transition: background 0.15s;
}

.btn-ver-fixture:hover { background: #154f8a; }

.bienvenida {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  position: relative;
}

.bienvenida.info {
  background: #e8f0fb;
  border-left: 4px solid var(--color-primary);
}

.bienvenida.warning {
  background: #fff8e1;
  border-left: 4px solid #e65100;
}

.bienvenida-icono { font-size: 1.5rem; }

.bienvenida strong {
  font-size: 1rem;
  color: var(--color-text);
  display: block;
  margin-bottom: 0.2rem;
}

.bienvenida p {
  margin: 0;
  font-size: 0.875rem;
  color: #555;
}

.bienvenida-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  font-size: 0.9rem;
}

.bienvenida-close:hover { color: #333; }
</style>
