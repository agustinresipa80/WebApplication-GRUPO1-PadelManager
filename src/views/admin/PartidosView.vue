<template>
  <div class="page">

    <div class="header">
      <div>
        <h1>Gestión de Partidos</h1>
        <p class="subtitle">ABM de partidos por torneo</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">+ Nuevo Partido</button>
    </div>

    <!-- Filtro por torneo -->
    <div class="filtro-wrapper card">
      <label>Filtrar por torneo</label>
      <select v-model="selectedTournamentId" @change="filterMatches">
        <option value="">Todos los torneos</option>
        <option
          v-for="t in tournaments"
          :key="t.id"
          :value="t.id"
        >
          {{ t.name }} ({{ t.category }})
        </option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-msg">Cargando partidos...</div>

    <!-- Tabla -->
    <div v-else-if="filteredMatches.length === 0" class="state-msg">
      No hay partidos para mostrar.
    </div>

    <div v-else class="table-wrapper card">
      <table>
        <thead>
          <tr>
            <th>Torneo</th>
            <th>Fase</th>
            <th>Pareja 1</th>
            <th>Pareja 2</th>
            <th>Resultado</th>
            <th>Ganador</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="match in filteredMatches" :key="match.id">
            <td>{{ getTournamentName(match.tournamentId) }}</td>
            <td>
              <span class="phase-badge" :class="`phase-${match.phase}`">
                {{ capitalize(match.phase) }}
              </span>
            </td>
            <td>{{ getPairName(match.pair1Id) }}</td>
            <td>{{ getPairName(match.pair2Id) }}</td>
            <td>{{ match.score1 || '-' }} / {{ match.score2 || '-' }}</td>
            <td>
              <span v-if="match.winnerId" class="winner-cell">
                🏆 {{ getPairName(match.winnerId) }}
              </span>
              <span v-else class="pending-cell">⏳ Pendiente</span>
            </td>
            <td class="actions-cell">
              <button class="btn btn-outline" @click="editMatch(match)">Editar</button>
              <button class="btn btn-danger"  @click="deleteMatch(match.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">

        <div class="modal-header">
          <h2>{{ editing ? '✏️ Editar Partido' : '➕ Nuevo Partido' }}</h2>
          <button class="btn-close" @click="showModal = false">✕</button>
        </div>

        <div class="modal-body">

          <div class="form-group">
            <label>Torneo *</label>
            <select v-model="form.tournamentId">
              <option value="" disabled>Seleccioná un torneo</option>
              <option v-for="t in tournaments" :key="t.id" :value="t.id">
                {{ t.name }} ({{ t.category }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Fase *</label>
            <select v-model="form.phase">
              <option value="cuartos">Cuartos de final</option>
              <option value="semis">Semifinal</option>
              <option value="final">Final</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Pareja 1 *</label>
              <select v-model="form.pair1Id">
                <option value="" disabled>Seleccioná</option>
                <option
                  v-for="p in players"
                  :key="p.id"
                  :value="p.id"
                  :disabled="p.id === form.pair2Id"
                >
                  {{ p.player1 }} / {{ p.player2 }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Pareja 2 *</label>
              <select v-model="form.pair2Id">
                <option value="" disabled>Seleccioná</option>
                <option
                  v-for="p in players"
                  :key="p.id"
                  :value="p.id"
                  :disabled="p.id === form.pair1Id"
                >
                  {{ p.player1 }} / {{ p.player2 }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Score Pareja 1</label>
              <input v-model="form.score1" placeholder="ej: 6-4, 7-5" />
            </div>

            <div class="form-group">
              <label>Score Pareja 2</label>
              <input v-model="form.score2" placeholder="ej: 4-6, 3-7" />
            </div>
          </div>

          <div class="form-group" v-if="form.pair1Id && form.pair2Id">
            <label>Ganador</label>
            <select v-model="form.winnerId">
              <option value="">Sin definir</option>
              <option :value="form.pair1Id">{{ getPairName(form.pair1Id) }}</option>
              <option :value="form.pair2Id">{{ getPairName(form.pair2Id) }}</option>
            </select>
          </div>

          <p v-if="formError" class="form-error">{{ formError }}</p>

        </div>

        <div class="modal-footer">
          <button class="btn" @click="showModal = false">Cancelar</button>
          <button class="btn btn-success" @click="saveMatch" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

const API = import.meta.env.VITE_MOCKAPI_URL

const matches     = ref([])
const players     = ref([])
const tournaments = ref([])

const loading            = ref(true)
const saving             = ref(false)
const showModal          = ref(false)
const editing            = ref(false)
const selectedTournamentId = ref('')
const formError          = ref('')

const form = reactive({
  id:           null,
  tournamentId: '',
  phase:        'cuartos',
  pair1Id:      '',
  pair2Id:      '',
  score1:       '',
  score2:       '',
  winnerId:     ''
})

// Filtrado por torneo seleccionado
const filteredMatches = computed(() => {
  if (!selectedTournamentId.value) return matches.value
  return matches.value.filter(m => m.tournamentId === selectedTournamentId.value)
})

async function loadData() {
  loading.value = true
  try {
    const [matchesRes, playersRes, tournamentsRes] = await Promise.all([
      fetch(`${API}/matches`),
      fetch(`${API}/players`),
      fetch(`${API}/tournaments`)
    ])
    matches.value     = await matchesRes.json()
    players.value     = await playersRes.json()
    tournaments.value = await tournamentsRes.json()
  } finally {
    loading.value = false
  }
}

function getPairName(id) {
  const pair = players.value.find(p => p.id === id)
  if (!pair) return '-'
  return `${pair.player1} / ${pair.player2}`
}

function getTournamentName(id) {
  const t = tournaments.value.find(t => t.id === id)
  return t ? t.name : '-'
}

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function filterMatches() {
  // El computed filteredMatches se actualiza reactivamente
}

function openCreate() {
  editing.value  = false
  formError.value = ''
  Object.assign(form, {
    id:           null,
    tournamentId: selectedTournamentId.value || '',
    phase:        'cuartos',
    pair1Id:      '',
    pair2Id:      '',
    score1:       '',
    score2:       '',
    winnerId:     ''
  })
  showModal.value = true
}

function editMatch(match) {
  editing.value   = true
  formError.value = ''
  Object.assign(form, { ...match })
  showModal.value = true
}

function validateForm() {
  if (!form.tournamentId) return 'Seleccioná un torneo.'
  if (!form.pair1Id)      return 'Seleccioná la Pareja 1.'
  if (!form.pair2Id)      return 'Seleccioná la Pareja 2.'
  if (form.pair1Id === form.pair2Id) return 'Las parejas no pueden ser la misma.'
  return null
}

async function saveMatch() {
  formError.value = validateForm()
  if (formError.value) return

  saving.value = true
  try {
    const body = {
      tournamentId: form.tournamentId,
      phase:        form.phase,
      pair1Id:      form.pair1Id,
      pair2Id:      form.pair2Id,
      score1:       form.score1,
      score2:       form.score2,
      winnerId:     form.winnerId
    }

    const url    = editing.value ? `${API}/matches/${form.id}` : `${API}/matches`
    const method = editing.value ? 'PUT' : 'POST'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    showModal.value = false
    await loadData()
  } finally {
    saving.value = false
  }
}

async function deleteMatch(id) {
  if (!confirm('¿Seguro que querés eliminar este partido?')) return
  await fetch(`${API}/matches/${id}`, { method: 'DELETE' })
  await loadData()
}

onMounted(loadData)
</script>

<style scoped>
.page {
  padding: 2rem;
  max-width: 1100px;
  margin: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.header h1 {
  font-size: 1.75rem;
  color: var(--color-primary);
}

.subtitle {
  color: var(--color-text-muted);
  margin-top: 0.25rem;
  font-size: 0.9rem;
}

.state-msg {
  text-align: center;
  color: var(--color-text-muted);
  margin-top: 2rem;
}

/* Filtro */
.filtro-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
}

.filtro-wrapper label {
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
}

.filtro-wrapper select {
  flex: 1;
  max-width: 380px;
  padding: 0.5rem 0.85rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 0.9rem;
}

/* Tabla */
.table-wrapper {
  padding: 0;
  overflow-x: auto;
}

.phase-badge {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.phase-cuartos { background: #e3f2fd; color: #1565c0; }
.phase-semis   { background: #fff3e0; color: #e65100; }
.phase-final   { background: #fce4ec; color: #880e4f; }

.winner-cell  { color: var(--color-secondary); font-weight: 600; }
.pending-cell { color: var(--color-warning);   font-weight: 500; }

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 14px;
  width: 100%;
  max-width: 560px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  font-size: 1.1rem;
  color: var(--color-primary);
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: var(--color-text-muted);
  padding: 0.25rem;
  line-height: 1;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 65vh;
  overflow-y: auto;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-error {
  color: var(--color-danger);
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
  background: #fafafa;
}
</style>