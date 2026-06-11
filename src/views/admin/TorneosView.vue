<template>
  <div class="page">
    <div class="page-header">
      <h1>Gestión de Torneos</h1>
    </div>

    <p v-if="errorMsg" class="error-banner">❌ Error: {{ errorMsg }}</p>

    <!-- FORMULARIO DE ALTA Y EDICIÓN -->
    <div class="form-container">
      <h2>{{ editandoId ? '📝 Editar Torneo' : '➕ Crear Nuevo Torneo' }}</h2>
      <form @submit.prevent="guardarTorneo" class="torneo-form">
        <div class="form-group">
          <label>Nombre del Torneo:</label>
          <input type="text" v-model="formulario.name" required placeholder="Ej: Torneo de Invierno" />
        </div>

        <div class="form-group">
          <label>Categoría:</label>
          <select v-model="formulario.category">
            <option v-for="cat in ['1ra', '2da', '3ra', '4ta', '5ta', '6ta']" :key="cat" :value="cat">
              {{ cat }} Categoría
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Fecha de Inicio:</label>
          <input type="date" v-model="formulario.date" required />
        </div>

        <div class="form-group">
          <label>Premio:</label>
          <input type="text" v-model="formulario.prize" required placeholder="Ej: Paletas Premium" />
        </div>

        <div class="form-group">
          <label>Estado del Torneo:</label>
          <select v-model="formulario.status">
            <option value="draft">Borrador</option>
            <option value="active">Activo</option>
            <option value="finished">Finalizado</option>
          </select>
        </div>

        <div class="form-group">
          <label>Máximo de Parejas:</label>
          <input type="number" v-model.number="formulario.maxPairs" min="2" required />
        </div>

        <div class="actions">
          <button type="submit" class="btn-submit">
            {{ editandoId ? 'Guardar Cambios' : 'Registrar Torneo' }}
          </button>
          <button type="button" v-if="editandoId" @click="limpiarFormulario" class="btn-cancel">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <!-- TABLA DE VISUALIZACIÓN -->
    <div class="table-container">
      <h2>📋 Torneos Existentes</h2>
      <p v-if="cargando">Buscando torneos en el servidor...</p>
      
      <table v-else class="torneos-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Fecha</th>
            <th>Premio</th>
            <th>Estado</th>
            <th>Parejas Max</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="torneo in torneos" :key="torneo.id">
            <td><strong>{{ torneo.name }}</strong></td>
            <td>{{ torneo.category }}</td>
            <td>{{ torneo.date }}</td>
            <td>{{ torneo.prize }}</td>
            <td>
              <span :class="`status-badge ${torneo.status}`">{{ torneo.status }}</span>
            </td>
            <td>{{ torneo.maxPairs }}</td>
            <td>
              <button @click="prepararEdicion(torneo)" class="btn-edit">Editar</button>
              <button @click="eliminarTorneo(torneo.id)" class="btn-delete">Eliminar</button>
            </td>
          </tr>
          <tr v-if="torneos.length === 0 && !cargando">
            <td colspan="7" style="text-align: center;">No hay torneos creados todavía.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// URL base de MockAPI (PONÉ LA URL DE TU PROPIO MOCKAPI ACÁ)
const MOCK_API_URL = `${import.meta.env.VITE_API_URL}/tournaments`;

const torneos = ref([]);
const cargando = ref(false);
const errorMsg = ref(null);
const editandoId = ref(null);

const formulario = ref({
  name: '',
  category: '4ta',
  date: '',
  prize: '',
  status: 'draft',
  maxPairs: 16
});

const obtenerTorneos = async () => {
  cargando.value = true;
  errorMsg.value = null;
  try {
    const res = await fetch(MOCK_API_URL);
    if (!res.ok) throw new Error('Error al traer torneos');
    torneos.value = await res.json();
  } catch (err) {
    errorMsg.value = err.message;
  } finally {
    cargando.value = false;
  }
};

const guardarTorneo = async () => {
  try {
    let res;
    if (editandoId.value) {
      res = await fetch(`${MOCK_API_URL}/${editandoId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario.value)
      });
    } else {
      res = await fetch(MOCK_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario.value)
      });
    }
    if (!res.ok) throw new Error('Error al guardar');
    limpiarFormulario();
    await obtenerTorneos();
  } catch (err) {
    errorMsg.value = err.message;
  }
};

const prepararEdicion = (torneo) => {
  editandoId.value = torneo.id;
  formulario.value = { ...torneo };
};

const eliminarTorneo = async (id) => {
  if (!confirm('¿Eliminar torneo?')) return;
  try {
    const res = await fetch(`${MOCK_API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar');
    await obtenerTorneos();
  } catch (err) {
    errorMsg.value = err.message;
  }
};

const limpiarFormulario = () => {
  editandoId.value = null;
  formulario.value = { name: '', category: '4ta', date: '', prize: '', status: 'draft', maxPairs: 16 };
};

onMounted(() => {
  obtenerTorneos();
});
</script>

<style scoped>
.page { padding: 2rem; max-width: 1100px; margin: 0 auto; font-family: sans-serif; }
.page-header h1 { font-size: 1.8rem; color: var(--color-primary); margin: 0 0 1rem; }

/* Estilos para el formulario y la tabla adaptados */
.form-container, .table-container { background: #1e1e1e; color: #fff; padding: 20px; margin-top: 20px; border-radius: 6px; }
.torneo-form { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.form-group { display: flex; flex-direction: column; }
.form-group label { margin-bottom: 5px; font-size: 0.9rem; color: #fff; }
.form-group input, .form-group select { padding: 8px; background: #2d2d2d; border: 1px solid #444; color: #fff; border-radius: 4px; }
.actions { grid-column: span 2; display: flex; gap: 10px; margin-top: 10px; }
.btn-submit { background: var(--color-primary, #007bff); color: white; padding: 10px 25px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
.btn-cancel { background: #555; color: white; padding: 10px 25px; border: none; border-radius: 4px; cursor: pointer; }
.torneos-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
.torneos-table th, .torneos-table td { border: 1px solid #333; padding: 12px; text-align: left; }
.torneos-table th { background: #2d2d2d; }
.btn-edit { background: #ffc107; border: none; padding: 6px 12px; margin-right: 5px; border-radius: 4px; cursor: pointer; color: #000; }
.btn-delete { background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
.status-badge { padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; }
.status-badge.draft { background: #555; }
.status-badge.active { background: #28a745; }
.status-badge.finished { background: #6c757d; }
.error-banner { background: #dc3545; color: white; padding: 10px; border-radius: 4px; margin-top: 10px; }
</style>