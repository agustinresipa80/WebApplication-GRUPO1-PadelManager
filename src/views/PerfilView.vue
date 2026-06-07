<template>
  <div class="page">
    <h1>Mi Perfil</h1>

    <div v-if="pair">
      <div class="card">
        <h2>
          {{ pair.player1 }} / {{ pair.player2 }}
        </h2>

        <p>Puntos: {{ pair.points }}</p>
      </div>

      <div class="card">
        <h2>Estadísticas</h2>

        <p>Victorias: {{ wins }}</p>
        <p>Derrotas: {{ losses }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const pair = ref(null)
const matches = ref([])

const wins = computed(() =>
  matches.value.filter(
    m => m.winnerId === pair.value?.id
  ).length
)

const losses = computed(() =>
  matches.value.filter(
    m =>
      (m.pair1Id === pair.value?.id ||
       m.pair2Id === pair.value?.id)
      &&
      m.winnerId !== pair.value?.id
  ).length
)

async function loadData() {

  const playersRes =
    await fetch(`${import.meta.env.VITE_MOCKAPI_URL}/players`)

  const players = await playersRes.json()

  pair.value = players[0]

  const matchesRes =
    await fetch(`${import.meta.env.VITE_MOCKAPI_URL}/matches`)

  matches.value = await matchesRes.json()
}

onMounted(loadData)
</script>

<style scoped>
.page {
  max-width: 1000px;
  margin: auto;
  padding: 2rem;
}

.card {
  background: white;
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 10px;
}
</style>