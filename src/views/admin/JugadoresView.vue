<template>
  <div class="page">
    <div class="page-header">
      <h1>Gestión de Jugadores y Parejas</h1>
    </div>

    <p v-if="errorMsg" class="error-banner">❌ Error: {{ errorMsg }}</p>

    <div class="form-container">
      <h2>{{ editandoId ? '📝 Editar Pareja' : '➕ Registrar Nueva Pareja' }}</h2>
      <form @submit.prevent="guardarJugador" class="jugador-form">

        <!-- Toggle de modo -->
<div class="form-group-full">
  <label>Modo de registro:</label>
  <div class="toggle-modo">
    <button type="button" :class="['btn-modo', !modoManual ? 'active' : '']" @click="modoManual = false">
      👤 Usuario registrado
    </button>
    <button type="button" :class="['btn-modo', modoManual ? 'active' : '']" @click="modoManual = true">
      ✏️ Ingresar manualmente
    </button>
  </div>
</div>

        <!-- Modo usuario registrado -->
        <template v-if="!modoManual">
          <div class="form-group">
            <label>Jugador 1 (usuario registrado):</label>
            <select v-model="formulario.user1Id" @change="onUser1Change">
              <option value="">Seleccioná un usuario...</option>
              <option v-for="u in usuariosJugadores" :key="u.id" :value="u.id" :disabled="u.id === formulario.user2Id">
                {{ u.name }} ({{ u.email }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Jugador 2 (usuario registrado):</label>
            <select v-model="formulario.user2Id" @change="onUser2Change">
              <option value="">Seleccioná un usuario...</option>
              <option v-for="u in usuariosJugadores" :key="u.id" :value="u.id" :disabled="u.id === formulario.user1Id">
                {{ u.name }} ({{ u.email }})
              </option>
            </select>
          </div>
        </template>

        <!-- Modo manual -->
        <template v-else>
          <div class="form-group">
            <label>Jugador 1 (Nombre completo):</label>
            <input type="text" v-model="formulario.player1" placeholder="Ej: Juan Pérez" />
          </div>
          <div class="form-group">
            <label>Jugador 2 (Nombre completo):</label>
            <input type="text" v-model="formulario.player2" placeholder="Ej: Martín Gómez" />
          </div>
        </template>

        <div class="form-group">
          <label>Categoría de la Pareja:</label>
          <select v-model="formulario.category">
            <option v-for="cat in ['1ra', '2da', '3ra', '4ta', '5ta', '6ta']" :key="cat" :value="cat">
              {{ cat }} Categoría
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Puntos de Clasificación:</label>
          <input type="number" v-model.number="formulario.points" min="0" required />
        </div>

        <div class="form-group-full">
          <label>Asignar a Torneo:</label>
          <select v-model="formulario.tournamentId" required>
            <option value="" disabled>Seleccioná un torneo...</option>
            <option v-for="t in torneosDisponiblesFiltrados" :key="t.id" :value="t.id">
              {{ t.name }} ({{ t.category }})
            </option>
          </select>
        </div>

        <div class="actions">
          <button type="submit" class="btn-submit">
            {{ editandoId ? 'Guardar Cambios' : 'Registrar Pareja' }}
          </button>
          <button type="button" v-if="editandoId" @click="limpiarFormulario" class="btn-cancel">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <div class="table-container">
      <h2>📋 Parejas Registradas</h2>
      <p v-if="cargando">Buscando registros en el servidor...</p>

      <table v-else class="jugadores-table">
        <thead>
          <tr>
            <th>Jugador 1</th>
            <th>Jugador 2</th>
            <th>Categoría</th>
            <th>Puntos</th>
            <th>Torneo Asignado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="j in jugadores" :key="j.id">
            <td><strong>{{ j.player1 }}</strong></td>
            <td><strong>{{ j.player2 }}</strong></td>
            <td>{{ j.category }}</td>
            <td>{{ j.points }} pts</td>
            <td>{{ obtenerNombreTorneo(j.tournamentId) }}</td>
            <td>
              <button @click="prepararEdicion(j)" class="btn-edit">Editar</button>
              <button @click="eliminarJugador(j.id)" class="btn-delete">Eliminar</button>
            </td>
          </tr>
          <tr v-if="jugadores.length === 0 && !cargando">
            <td colspan="6" style="text-align: center;">No hay parejas registradas todavía.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const API_JUGADORES = `${import.meta.env.VITE_API_URL}/players`
const API_TORNEOS   = `${import.meta.env.VITE_API_URL}/tournaments`
const API_USERS     = `${import.meta.env.VITE_API_URL}/users`

const jugadores        = ref([])
const torneos          = ref([])
const usuarios         = ref([])
const cargando         = ref(false)
const errorMsg         = ref(null)
const editandoId       = ref(null)
const modoManual = ref(false)
const formulario = ref({
  user1Id:      '',
  user2Id:      '',
  player1:      '',
  player2:      '',
  category:     '4ta',
  points:       0,
  tournamentId: ''
})

// Solo usuarios con rol player
const usuariosJugadores = computed(() =>
  usuarios.value.filter(u => u.role === 'player')
)

const obtenerNumeroCategoria = (catTexto) => parseInt(catTexto) || 0

const torneosDisponiblesFiltrados = computed(() => {
  if (!formulario.value.category) return torneos.value
  const catJugadorNum = obtenerNumeroCategoria(formulario.value.category)
  return torneos.value.filter(t => obtenerNumeroCategoria(t.category) >= catJugadorNum)
})

// Cuando selecciona usuario 1, auto-completa player1
function onUser1Change() {
  const u = usuarios.value.find(u => u.id === formulario.value.user1Id)
  if (u) formulario.value.player1 = u.name
}

// Cuando selecciona usuario 2, auto-completa player2
function onUser2Change() {
  const u = usuarios.value.find(u => u.id === formulario.value.user2Id)
  if (u) formulario.value.player2 = u.name
}

const cargarDatos = async () => {
  cargando.value = true
  errorMsg.value = null
  try {
    const [resJugadores, resTorneos, resUsers] = await Promise.all([
      fetch(API_JUGADORES),
      fetch(API_TORNEOS),
      fetch(API_USERS)
    ])
    if (!resJugadores.ok || !resTorneos.ok || !resUsers.ok)
      throw new Error('Error al conectar con Railway')

    jugadores.value = await resJugadores.json()
    torneos.value   = await resTorneos.json()
    usuarios.value  = await resUsers.json()
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    cargando.value = false
  }
}

const guardarJugador = async () => {
  try {
    const body = { ...formulario.value }

    // Si es modo manual, limpiamos los IDs de usuario
    if (modoManual.value) {
      body.user1Id = ''
      body.user2Id = ''
    }

    let res
    if (editandoId.value) {
      res = await fetch(`${API_JUGADORES}/${editandoId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
    } else {
      res = await fetch(API_JUGADORES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
    }
    if (!res.ok) throw new Error('Error al guardar la pareja')
    limpiarFormulario()
    await cargarDatos()
  } catch (err) {
    errorMsg.value = err.message
  }
}

const prepararEdicion = (jugador) => {
  editandoId.value  = jugador.id
  formulario.value  = { ...jugador }
}

const eliminarJugador = async (id) => {
  if (!confirm('¿Eliminar esta pareja?')) return
  try {
    const res = await fetch(`${API_JUGADORES}/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Error al eliminar')
    await cargarDatos()
  } catch (err) {
    errorMsg.value = err.message
  }
}

const obtenerNombreTorneo = (id) => {
  const t = torneos.value.find(t => t.id === id)
  return t ? t.name : 'Sin asignar'
}

const limpiarFormulario = () => {
  editandoId.value = null
  formulario.value = { user1Id: '', user2Id: '', player1: '', player2: '', category: '4ta', points: 0, tournamentId: '' }
}

onMounted(cargarDatos)
</script>

<style scoped>
.page { padding: 2rem; max-width: 1100px; margin: 0 auto; }
.page-header h1 { font-size: 1.8rem; color: var(--color-primary); margin: 0 0 1rem; }
.form-container, .table-container { background: #1e1e1e; color: #fff; padding: 20px; margin-top: 20px; border-radius: 6px; }
.jugador-form { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.form-group { display: flex; flex-direction: column; }
.form-group-full { grid-column: span 2; display: flex; flex-direction: column; }
.form-group label, .form-group-full label { margin-bottom: 5px; font-size: 0.9rem; color: #fff; }
.form-group input, .form-group select, .form-group-full select { padding: 8px; background: #2d2d2d; border: 1px solid #444; color: #fff; border-radius: 4px; }
.actions { grid-column: span 2; display: flex; gap: 10px; margin-top: 10px; }
.btn-submit { background: var(--color-primary, #007bff); color: white; padding: 10px 25px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
.btn-cancel { background: #555; color: white; padding: 10px 25px; border: none; border-radius: 4px; cursor: pointer; }
.jugadores-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
.jugadores-table th, .jugadores-table td { border: 1px solid #333; padding: 12px; text-align: left; }
.jugadores-table th { background: #2d2d2d; }
.btn-edit { background: #ffc107; border: none; padding: 6px 12px; margin-right: 5px; border-radius: 4px; cursor: pointer; color: #000; }
.btn-delete { background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
.error-banner { background: #dc3545; color: white; padding: 10px; border-radius: 4px; margin-top: 10px; }

.toggle-modo {
  display: flex;
  gap: 0.5rem;
}

.btn-modo {
  padding: 6px 16px;
  border: 1px solid #555;
  background: #2d2d2d;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.15s;
}

.btn-modo.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
}
</style>