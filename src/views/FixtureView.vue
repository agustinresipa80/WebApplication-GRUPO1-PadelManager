<template>
  <div class="page">

    <div class="page-header">
      <div>
        <h1>📋 Fixture</h1>
        <p class="subtitle" v-if="tournament">
          {{ tournament.name }} — {{ tournament.category }}
        </p>
      </div>
      <button class="btn btn-outline" @click="$router.back()">← Volver</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-msg">Cargando fixture...</div>

    <!-- Error -->
    <div v-else-if="error" class="state-msg error">{{ error }}</div>

    <!-- Sin partidos -->
    <div v-else-if="matches.length === 0" class="state-msg">
      Todavía no hay partidos cargados para este torneo.
    </div>

    <!-- Cuadro de fases -->
    <div v-else class="fixture-wrapper">
      <div
        v-for="phase in phasesWithMatches"
        :key="phase.key"
        class="phase-block"
      >
        <div class="phase-title">
          <span class="phase-icon">{{ phase.icon }}</span>
          {{ phase.label }}
          <span class="phase-count">{{ matchesByPhase(phase.key).length }} partido(s)</span>
        </div>

        <div class="matches-list">
          <div
            v-for="match in matchesByPhase(phase.key)"
            :key="match.id"
            class="match-card"
            :class="{ finished: match.winnerId, pending: !match.winnerId }"
          >
            <!-- Pareja 1 -->
            <div class="pair" :class="{ winner: match.winnerId === match.pair1Id }">
              <span class="pair-name">{{ getPairName(match.pair1Id) }}</span>
              <span class="pair-score" v-if="match.score1">{{ match.score1 }}</span>
              <span class="crown" v-if="match.winnerId === match.pair1Id">👑</span>
            </div>

            <div class="vs">VS</div>

            <!-- Pareja 2 -->
            <div class="pair" :class="{ winner: match.winnerId === match.pair2Id }">
              <span class="pair-name">{{ getPairName(match.pair2Id) }}</span>
              <span class="pair-score" v-if="match.score2">{{ match.score2 }}</span>
              <span class="crown" v-if="match.winnerId === match.pair2Id">👑</span>
            </div>

            <!-- Estado -->
            <div class="match-status">
              <span v-if="!match.winnerId" class="badge-pending">⏳ Pendiente</span>
              <span v-else class="badge-done">✅ Finalizado</span>
            </div>

            <!-- Crónica IA si existe -->
            <div v-if="match.summary" class="summary">
              <span class="summary-label">📰 Crónica</span>
              <p>{{ match.summary }}</p>
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const API   = import.meta.env.VITE_MOCKAPI_URL

const matches    = ref([])
const players    = ref([])
const tournament = ref(null)
const loading    = ref(true)
const error      = ref(null)

const allPhases = [
  { key: 'cuartos', label: 'Cuartos de final', icon: '⚔️' },
  { key: 'semis',   label: 'Semifinales',       icon: '🥊' },
  { key: 'final',   label: 'Final',             icon: '🏆' }
]

// Solo mostramos las fases que tienen partidos cargados
const phasesWithMatches = computed(() =>
  allPhases.filter(p => matchesByPhase(p.key).length > 0)
)

async function loadData() {
  loading.value = true
  error.value   = null
  try {
    const tournamentId = route.params.id

    const [matchesRes, playersRes, tournamentRes] = await Promise.all([
      fetch(`${API}/matches?tournamentId=${tournamentId}`),
      fetch(`${API}/players?tournamentId=${tournamentId}`),
      fetch(`${API}/tournaments/${tournamentId}`)
    ])

    matches.value    = await matchesRes.json()
    players.value    = await playersRes.json()
    tournament.value = await tournamentRes.json()

  } catch (e) {
    error.value = 'Error al cargar el fixture. Intentá de nuevo.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

function matchesByPhase(phase) {
  return matches.value.filter(m => m.phase === phase)
}

function getPairName(id) {
  const pair = players.value.find(p => p.id === id)
  if (!pair) return 'Por definir'
  return `${pair.player1} / ${pair.player2}`
}

onMounted(loadData)
</script>

<style scoped>
.page {
  padding: 2rem;
  max-width: 860px;
  margin: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  color: var(--color-primary);
}

.subtitle {
  color: var(--color-text-muted);
  margin-top: 0.25rem;
  font-size: 0.95rem;
}

.state-msg {
  text-align: center;
  color: var(--color-text-muted);
  margin-top: 3rem;
}

.state-msg.error {
  color: var(--color-danger);
}

/* Fases */
.phase-block {
  margin-bottom: 2rem;
}

.phase-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.phase-icon {
  font-size: 1.3rem;
}

.phase-count {
  margin-left: auto;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--color-text-muted);
  background: #f0f4ff;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
}

/* Partidos */
.matches-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.match-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: var(--shadow);
  display: grid;
  grid-template-columns: 1fr auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
}

.match-card.finished {
  border-left: 4px solid var(--color-secondary);
}

.match-card.pending {
  border-left: 4px solid var(--color-warning);
}

.pair {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.pair.winner {
  background: #e8f5e9;
}

.pair-name {
  font-weight: 600;
  font-size: 0.95rem;
  flex: 1;
}

.pair-score {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.crown {
  font-size: 1rem;
}

.vs {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--color-text-muted);
  background: #f0f0f0;
  padding: 0.25rem 0.4rem;
  border-radius: 6px;
}

.match-status {
  display: flex;
  justify-content: flex-end;
}

.badge-pending {
  font-size: 0.78rem;
  font-weight: 600;
  background: #fff8e1;
  color: #e65100;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
}

.badge-done {
  font-size: 0.78rem;
  font-weight: 600;
  background: #e8f5e9;
  color: #2e7d32;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
}

/* Crónica IA */
.summary {
  grid-column: 1 / -1;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-top: 0.25rem;
}

.summary-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 0.35rem;
}

.summary p {
  margin: 0;
  font-size: 0.88rem;
  color: var(--color-text);
  line-height: 1.5;
  font-style: italic;
}

@media (max-width: 600px) {
  .match-card {
    grid-template-columns: 1fr;
  }
  .match-status {
    justify-content: flex-start;
  }
}
</style>