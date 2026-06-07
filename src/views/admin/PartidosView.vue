<template>
  <div class="page">
    <div class="header">
      <h1>Gestión de Partidos</h1>

      <button class="btn btn-primary" @click="openCreate">
        Nuevo Partido
      </button>
    </div>

    <div v-if="loading">
      Cargando...
    </div>

    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Fase</th>
            <th>Pareja 1</th>
            <th>Pareja 2</th>
            <th>Resultado</th>
            <th>Ganador</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="match in matches"
            :key="match.id"
          >
            <td>{{ match.phase }}</td>

            <td>{{ getPairName(match.pair1Id) }}</td>

            <td>{{ getPairName(match.pair2Id) }}</td>

            <td>
              {{ match.score1 || '-' }}
              -
              {{ match.score2 || '-' }}
            </td>

            <td>
              {{ getPairName(match.winnerId) }}
            </td>

            <td>
              <button
                class="btn btn-outline"
                @click="editMatch(match)"
              >
                Editar
              </button>

              <button
                class="btn btn-danger"
                @click="deleteMatch(match.id)"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->

    <div
      v-if="showModal"
      class="modal-overlay"
    >
      <div class="modal">

        <div class="modal-header">
          <h2>
            {{ editing ? 'Editar Partido' : 'Nuevo Partido' }}
          </h2>
        </div>

        <div class="form-group">
          <label>Fase</label>

          <select v-model="form.phase">
            <option value="cuartos">Cuartos</option>
            <option value="semis">Semifinal</option>
            <option value="final">Final</option>
          </select>
        </div>

        <div class="form-group">
          <label>Pareja 1</label>

          <select v-model="form.pair1Id">
            <option
              v-for="player in players"
              :key="player.id"
              :value="player.id"
            >
              {{ player.player1 }} / {{ player.player2 }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Pareja 2</label>

          <select v-model="form.pair2Id">
            <option
              v-for="player in players"
              :key="player.id"
              :value="player.id"
            >
              {{ player.player1 }} / {{ player.player2 }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Score Pareja 1</label>
          <input v-model="form.score1">
        </div>

        <div class="form-group">
          <label>Score Pareja 2</label>
          <input v-model="form.score2">
        </div>

        <div class="form-group">
          <label>Ganador</label>

          <select v-model="form.winnerId">
            <option :value="form.pair1Id">
              Pareja 1
            </option>

            <option :value="form.pair2Id">
              Pareja 2
            </option>
          </select>
        </div>

        <div class="modal-footer">
          <button
            class="btn"
            @click="showModal=false"
          >
            Cancelar
          </button>

          <button
            class="btn btn-success"
            @click="saveMatch"
          >
            Guardar
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const API = import.meta.env.VITE_MOCKAPI_URL

const matches = ref([])
const players = ref([])

const loading = ref(true)

const showModal = ref(false)
const editing = ref(false)

const form = reactive({
  id: null,
  tournamentId: '',
  phase: 'cuartos',
  pair1Id: '',
  pair2Id: '',
  score1: '',
  score2: '',
  winnerId: ''
})

async function loadData() {

  loading.value = true

  const [matchesRes, playersRes] =
    await Promise.all([
      fetch(`${API}/matches`),
      fetch(`${API}/players`)
    ])

  matches.value = await matchesRes.json()
  players.value = await playersRes.json()

  loading.value = false
}

function getPairName(id) {

  const pair =
    players.value.find(p => p.id === id)

  if (!pair) return '-'

  return `${pair.player1} / ${pair.player2}`
}

function openCreate() {

  editing.value = false

  Object.assign(form,{
    id:null,
    tournamentId:'',
    phase:'cuartos',
    pair1Id:'',
    pair2Id:'',
    score1:'',
    score2:'',
    winnerId:''
  })

  showModal.value = true
}

function editMatch(match){

  editing.value = true

  Object.assign(form, match)

  showModal.value = true
}

async function saveMatch(){

  const body = {
    tournamentId: form.tournamentId,
    phase: form.phase,
    pair1Id: form.pair1Id,
    pair2Id: form.pair2Id,
    score1: form.score1,
    score2: form.score2,
    winnerId: form.winnerId
  }

  if(editing.value){

    await fetch(
      `${API}/matches/${form.id}`,
      {
        method:'PUT',
        headers:{
          'Content-Type':'application/json'
        },
        body: JSON.stringify(body)
      }
    )

  } else {

    await fetch(
      `${API}/matches`,
      {
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body: JSON.stringify(body)
      }
    )
  }

  showModal.value = false

  loadData()
}

async function deleteMatch(id){

  if(!confirm('¿Eliminar partido?'))
    return

  await fetch(
    `${API}/matches/${id}`,
    {
      method:'DELETE'
    }
  )

  loadData()
}

onMounted(loadData)
</script>

<style scoped>
.page{
  padding:2rem;
}

.header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:1rem;
}
</style>