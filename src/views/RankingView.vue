<template>
  <div class="page">
    <div class="page-header">
      <h1>🏆 Ranking General</h1>
      <p class="subtitle">Clasificación de parejas por puntos</p>
    </div>

    <div v-if="loading" class="state-msg">Cargando ranking...</div>
    <div v-else-if="parejas.length === 0" class="state-msg">No hay parejas registradas todavía.</div>

    <template v-else>
      <!-- Top 3 -->
      <div class="podio">
        <div v-if="parejas[1]" class="podio-card segundo">
          <div class="podio-posicion">🥈</div>
          <div class="podio-nombre">{{ parejas[1].player1 }} / {{ parejas[1].player2 }}</div>
          <div class="podio-categoria">{{ parejas[1].category }}</div>
          <div class="podio-puntos">{{ parejas[1].points }} pts</div>
          <div class="podio-base segundo-base">2°</div>
        </div>

        <div v-if="parejas[0]" class="podio-card primero">
          <div class="podio-posicion">🥇</div>
          <div class="podio-nombre">{{ parejas[0].player1 }} / {{ parejas[0].player2 }}</div>
          <div class="podio-categoria">{{ parejas[0].category }}</div>
          <div class="podio-puntos">{{ parejas[0].points }} pts</div>
          <div class="podio-base primero-base">1°</div>
        </div>

        <div v-if="parejas[2]" class="podio-card tercero">
          <div class="podio-posicion">🥉</div>
          <div class="podio-nombre">{{ parejas[2].player1 }} / {{ parejas[2].player2 }}</div>
          <div class="podio-categoria">{{ parejas[2].category }}</div>
          <div class="podio-puntos">{{ parejas[2].points }} pts</div>
          <div class="podio-base tercero-base">3°</div>
        </div>
      </div>

      <!-- Tabla completa -->
      <div class="card tabla-ranking">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Pareja</th>
              <th>Categoría</th>
              <th>Torneo</th>
              <th>Puntos</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(pareja, idx) in parejas"
              :key="pareja.id"
              :class="{ 'top3': idx < 3 }"
            >
              <td>
                <span class="pos-badge" :class="`pos-${idx + 1}`">
                  {{ idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1 }}
                </span>
              </td>
              <td>
                <strong>{{ pareja.player1 }}</strong> / {{ pareja.player2 }}
              </td>
              <td>{{ pareja.category }}</td>
              <td>{{ getTorneoNombre(pareja.tournamentId) }}</td>
              <td><strong class="puntos">{{ pareja.points }} pts</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const API = import.meta.env.VITE_API_URL

const parejas  = ref([])
const torneos  = ref([])
const loading  = ref(true)

async function cargarDatos() {
  try {
    const [resParejas, resTorneos] = await Promise.all([
      fetch(`${API}/players`),
      fetch(`${API}/tournaments`)
    ])
    const data = await resParejas.json()
    torneos.value = await resTorneos.json()
    // Ordenar por puntos de mayor a menor
    parejas.value = data.sort((a, b) => b.points - a.points)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function getTorneoNombre(id) {
  const t = torneos.value.find(t => t.id === id)
  return t ? t.name : '-'
}

onMounted(cargarDatos)
</script>

<style scoped>
.page { padding: 2rem; max-width: 900px; margin: 0 auto; }
.page-header h1 { font-size: 1.8rem; color: var(--color-primary); margin: 0 0 0.25rem; }
.subtitle { color: var(--color-text-muted); margin: 0 0 2rem; }
.state-msg { text-align: center; color: var(--color-text-muted); padding: 3rem; }

/* Podio */
.podio {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.podio-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  width: 200px;
}

.podio-posicion { font-size: 2.5rem; }

.podio-nombre {
  font-size: 0.875rem;
  font-weight: 700;
  text-align: center;
  color: var(--color-text);
}

.podio-categoria {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.podio-puntos {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-primary);
}

.podio-base {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  border-radius: 8px 8px 0 0;
  margin-top: 0.5rem;
}

.primero-base { background: #FFD700; height: 80px; }
.segundo-base { background: #C0C0C0; height: 60px; }
.tercero-base { background: #CD7F32; height: 45px; }

/* Tabla */
.tabla-ranking { padding: 0; overflow-x: auto; }
.top3 td { background: #fffbea; }

.pos-badge { font-size: 1.1rem; }

.puntos { color: var(--color-primary); }

@media (max-width: 640px) {
  .podio { flex-direction: column; align-items: center; }
  .podio-base { height: 40px !important; }
}
</style>