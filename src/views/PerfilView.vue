<template>
  <div class="page">
    <div class="page-header">
      <h1>Mi Perfil</h1>
      <p class="subtitle">Tu historial y estadísticas</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-msg">Cargando perfil...</div>

    <!-- Sin pareja asociada -->
    <div v-else-if="!pair" class="state-msg">
      No tenés ninguna pareja inscripta en un torneo todavía.
    </div>

    <!-- Perfil -->
    <div v-else class="perfil-grid">

      <!-- Tarjeta de identidad -->
      <div class="card perfil-card">
        <div class="avatar">🎾</div>
        <h2>{{ pair.player1 }} / {{ pair.player2 }}</h2>
        <span class="badge">{{ pair.category }}</span>
        <div class="puntos">
          <span class="puntos-numero">{{ pair.points }}</span>
          <span class="puntos-label">puntos</span>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="stats-col">
        <div class="card stat-card">
          <div class="stat-icon win">🏆</div>
          <div class="stat-info">
            <span class="stat-numero">{{ wins }}</span>
            <span class="stat-label">Victorias</span>
          </div>
        </div>

        <div class="card stat-card">
          <div class="stat-icon loss">❌</div>
          <div class="stat-info">
            <span class="stat-numero">{{ losses }}</span>
            <span class="stat-label">Derrotas</span>
          </div>
        </div>

        <div class="card stat-card">
          <div class="stat-icon total">🎯</div>
          <div class="stat-info">
            <span class="stat-numero">{{ totalMatches }}</span>
            <span class="stat-label">Partidos jugados</span>
          </div>
        </div>

        <div class="card stat-card" v-if="totalMatches > 0">
          <div class="stat-icon pct">📊</div>
          <div class="stat-info">
            <span class="stat-numero">{{ winPct }}%</span>
            <span class="stat-label">% de victorias</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Historial de partidos -->
    <div v-if="pair && myMatches.length > 0" class="card historial">
      <h2>Historial de partidos</h2>
      <table>
        <thead>
          <tr>
            <th>Fase</th>
            <th>Rival</th>
            <th>Resultado</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="match in myMatches" :key="match.id">
            <td>{{ capitalize(match.phase) }}</td>
            <td>{{ getRival(match) }}</td>
            <td>{{ match.score1 || '-' }} / {{ match.score2 || '-' }}</td>
            <td>
              <span
                class="resultado-badge"
                :class="match.winnerId === pair.id ? 'win' : match.winnerId ? 'loss' : 'pending'"
              >
                {{ match.winnerId === pair.id ? '✅ Victoria' : match.winnerId ? '❌ Derrota' : '⏳ Pendiente' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const API = import.meta.env.VITE_API_URL

const allPlayers = ref([])
const pair     = ref(null)
const matches  = ref([])
const loading  = ref(true)

// Solo los partidos donde participó esta pareja
const myMatches = computed(() =>
  matches.value.filter(
    m => m.pair1Id === pair.value?.id || m.pair2Id === pair.value?.id
  )
)

const wins = computed(() =>
  myMatches.value.filter(m => m.winnerId === pair.value?.id).length
)

const losses = computed(() =>
  myMatches.value.filter(
    m => m.winnerId && m.winnerId !== pair.value?.id
  ).length
)

const totalMatches = computed(() => myMatches.value.length)

const winPct = computed(() =>
  totalMatches.value > 0
    ? Math.round((wins.value / totalMatches.value) * 100)
    : 0
)

function getRival(match) {
  const rivalId = match.pair1Id === pair.value?.id ? match.pair2Id : match.pair1Id
  const rival = allPlayers.value.find(p => p.id === rivalId)
  if (!rival) return `Pareja ID: ${rivalId}`
  return `${rival.player1} / ${rival.player2}`
}

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

async function loadData() {
  loading.value = true
  try {
    // Buscamos la pareja asociada al usuario logueado
    // El usuario tiene un email; buscamos la pareja cuyo player1 o player2 coincida
    // O si el modelo de datos tiene un campo userId, lo usamos directo
    const user = authStore.user

    const [playersRes, matchesRes] = await Promise.all([
      fetch(`${API}/players`),
      fetch(`${API}/matches`)
    ])

    const players = await playersRes.json()
    allPlayers.value = players
    matches.value = await matchesRes.json()

    // Intentamos matchear por nombre del usuario (field "name" del store)
    // o por un campo playerId si existe en el modelo
    const userName = user?.name?.toLowerCase() || ''

    pair.value = players.length > 0 ? players[0] : null

  } catch (e) {
    console.error('Error cargando perfil:', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.page {
  max-width: 900px;
  margin: auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  color: var(--color-primary);
}

.subtitle {
  color: var(--color-text-muted);
  margin-top: 0.25rem;
}

.state-msg {
  text-align: center;
  color: var(--color-text-muted);
  margin-top: 3rem;
  font-size: 1rem;
}

/* Grid principal */
.perfil-grid {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

/* Tarjeta de identidad */
.perfil-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
  padding: 2rem 1.25rem;
}

.avatar {
  font-size: 3rem;
  background: #e8f0fe;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.perfil-card h2 {
  font-size: 1.1rem;
  color: var(--color-text);
}

.badge {
  background: var(--color-primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
}

.puntos {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 0.5rem;
}

.puntos-numero {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1;
}

.puntos-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Stats */
.stats-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-content: start;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
}

.stat-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.stat-icon.win   { background: #e8f5e9; }
.stat-icon.loss  { background: #fdecea; }
.stat-icon.total { background: #fff3e0; }
.stat-icon.pct   { background: #e8eaf6; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-numero {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-text);
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: 0.15rem;
}

/* Historial */
.historial {
  margin-top: 0.5rem;
}

.historial h2 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--color-primary);
}

.resultado-badge {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
}

.resultado-badge.win     { background: #e8f5e9; color: #2e7d32; }
.resultado-badge.loss    { background: #fdecea; color: #c62828; }
.resultado-badge.pending { background: #fff8e1; color: #e65100; }

@media (max-width: 640px) {
  .perfil-grid {
    grid-template-columns: 1fr;
  }
  .stats-col {
    grid-template-columns: 1fr 1fr;
  }
}
</style>