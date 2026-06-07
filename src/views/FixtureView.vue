<template>
  <div class="page">
    <div class="page-header">
      <h1>Fixture del Torneo</h1>
    </div>

    <div v-if="loading">Cargando partidos...</div>

    <div v-else-if="matches.length === 0">
      No hay partidos cargados.
    </div>

    <div v-else>
      <div
        v-for="phase in phases"
        :key="phase"
        class="phase-card"
      >
        <h2>{{ phase }}</h2>

        <div
          v-for="match in matchesByPhase(phase)"
          :key="match.id"
          class="match"
        >
          <div>
            <strong>{{ getPairName(match.pair1Id) }}</strong>
          </div>

          <div>
            <strong>{{ getPairName(match.pair2Id) }}</strong>
          </div>

          <div class="score">
            {{ match.score1 }} | {{ match.score2 }}
          </div>

          <div class="winner">
            🏆 {{ getPairName(match.winnerId) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const matches = ref([])
const players = ref([])
const loading = ref(true)

const phases = ['cuartos', 'semis', 'final']

async function loadData() {
  try {
    const tournamentId = route.params.id

    const [matchesRes, playersRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_MOCKAPI_URL}/matches?tournamentId=${tournamentId}`),
      fetch(`${import.meta.env.VITE_MOCKAPI_URL}/players`)
    ])

    matches.value = await matchesRes.json()
    players.value = await playersRes.json()
  } finally {
    loading.value = false
  }
}

function matchesByPhase(phase) {
  return matches.value.filter(m => m.phase === phase)
}

function getPairName(id) {
  const pair = players.value.find(p => p.id === id)

  if (!pair) return '-'

  return `${pair.player1} / ${pair.player2}`
}

onMounted(loadData)
</script>

<style scoped>
.page {
  padding: 2rem;
  max-width: 1100px;
  margin: auto;
}

.phase-card {
  background: white;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 10px;
}

.match {
  border: 1px solid #eee;
  padding: 1rem;
  margin-top: .75rem;
  border-radius: 8px;
}

.score {
  margin-top: .5rem;
}

.winner {
  margin-top: .5rem;
  color: green;
}
</style>