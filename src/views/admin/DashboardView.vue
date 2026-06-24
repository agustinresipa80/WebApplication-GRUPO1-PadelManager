<template>
  <div class="page">
    <div class="page-header">
      <h1>Dashboard de Estadísticas</h1>
      <p class="subtitle">Métricas principales de PadelManager.</p>
    </div>

    <p v-if="errorMensaje" class="error-msg">{{ errorMensaje }}</p>

    <div v-if="cargando" class="state-msg">Cargando estadísticas...</div>

    <template v-else>
      <!-- Tarjetas de métricas -->
      <div class="metricas-grid">
        <div class="metrica-card">
          <div class="metrica-icono">🏆</div>
          <div class="metrica-info">
            <span class="metrica-numero">{{ totalTorneos }}</span>
            <span class="metrica-label">Torneos totales</span>
          </div>
        </div>
        <div class="metrica-card activos">
          <div class="metrica-icono">🟢</div>
          <div class="metrica-info">
            <span class="metrica-numero">{{ torneosActivos }}</span>
            <span class="metrica-label">Torneos activos</span>
          </div>
        </div>
        <div class="metrica-card">
          <div class="metrica-icono">👥</div>
          <div class="metrica-info">
            <span class="metrica-numero">{{ totalParejas }}</span>
            <span class="metrica-label">Parejas inscriptas</span>
          </div>
        </div>
        <div class="metrica-card">
          <div class="metrica-icono">🎾</div>
          <div class="metrica-info">
            <span class="metrica-numero">{{ totalPartidos }}</span>
            <span class="metrica-label">Partidos jugados</span>
          </div>
        </div>
      </div>

      <!-- Gráfico -->
      <div class="chart-container">
        <Bar :data="chartData" :options="chartOptions" />
      </div>

      <!-- Botón IA -->
      <div class="ia-section">
        <button
          @click="generarAnalisisIA"
          class="btn btn-success"
          :disabled="cargandoIA"
        >
          {{ cargandoIA ? 'Generando...' : '🤖 Generar Análisis Estratégico con IA' }}
        </button>

        <div v-if="analisisIA" class="ia-resultado">
          <h3>Recomendación de PadelManager AI</h3>
          <p>{{ analisisIA }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const API = import.meta.env.VITE_API_URL

const cargando     = ref(true)
const errorMensaje = ref('')
const cargandoIA   = ref(false)
const analisisIA   = ref('')
const datosConteo  = ref({})

// Métricas
const totalTorneos   = ref(0)
const torneosActivos = ref(0)
const totalParejas   = ref(0)
const totalPartidos  = ref(0)

const chartData = ref({
  labels: [],
  datasets: [{
    label: 'Parejas Inscriptas por Categoría',
    backgroundColor: '#1B5E9C',
    borderRadius: 6,
    data: []
  }]
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top' } },
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
})

const cargarEstadisticas = async () => {
  cargando.value = true
  try {
    const [resTorneos, resJugadores, resPartidos] = await Promise.all([
      fetch(`${API}/tournaments`),
      fetch(`${API}/players`),
      fetch(`${API}/matches`)
    ])

    const torneos  = await resTorneos.json()
    const jugadores = await resJugadores.json()
    const partidos = await resPartidos.json()

    // Métricas
    totalTorneos.value   = torneos.length
    torneosActivos.value = torneos.filter(t => t.status === 'active').length
    totalParejas.value   = jugadores.length
    totalPartidos.value  = partidos.filter(p => p.winnerId).length

    // Gráfico
    const conteo = {}
    jugadores.forEach(j => {
      const cat = j.category || 'Sin categoría'
      conteo[cat] = (conteo[cat] || 0) + 1
    })
    datosConteo.value = conteo

    chartData.value = {
      ...chartData.value,
      labels: Object.keys(conteo),
      datasets: [{ ...chartData.value.datasets[0], data: Object.values(conteo) }]
    }

  } catch (error) {
    errorMensaje.value = 'No se pudieron cargar las estadísticas.'
  } finally {
    cargando.value = false
  }
}

const generarAnalisisIA = async () => {
  if (Object.keys(datosConteo.value).length === 0) return
  cargandoIA.value = true
  analisisIA.value = ''
  try {
    const resumen = Object.entries(datosConteo.value).map(([cat, cant]) => `${cat}: ${cant}`).join(', ')
    const prompt = `Actúa como un experto administrador de clubes de pádel. Aquí tienes la cantidad de parejas inscriptas por categoría: ${resumen}. Torneos activos: ${torneosActivos.value}. Partidos jugados: ${totalPartidos.value}. Dame una recomendación estratégica corta (máximo 3 renglones) sobre qué tipo de torneo o promoción debería organizar este fin de semana para maximizar la participación.`

    const respuesta = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: [{ role: 'user', content: prompt }], temperature: 0.7 })
    })

    if (!respuesta.ok) throw new Error('Error Groq')
    const data = await respuesta.json()
    analisisIA.value = data.choices[0].message.content
  } catch {
    analisisIA.value = 'No se pudo generar el análisis. Intentá de nuevo.'
  } finally {
    cargandoIA.value = false
  }
}

onMounted(cargarEstadisticas)
</script>

<style scoped>
.page { padding: 2rem; max-width: 1100px; margin: 0 auto; }
.page-header h1 { font-size: 1.8rem; color: var(--color-primary); margin: 0 0 0.25rem; }
.subtitle { color: var(--color-text-muted); margin: 0 0 1.5rem; }
.state-msg { text-align: center; color: var(--color-text-muted); padding: 3rem; }
.error-msg { color: #c0392b; font-weight: 600; margin-bottom: 1rem; }

/* Tarjetas */
.metricas-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metrica-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow);
  transition: transform 0.15s;
}

.metrica-card:hover { transform: translateY(-2px); }
.metrica-card.activos { border-left: 4px solid #2E7D32; }

.metrica-icono { font-size: 2rem; }

.metrica-info { display: flex; flex-direction: column; }

.metrica-numero {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1;
}

.metrica-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
}

/* Gráfico */
.chart-container {
  height: 350px;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  margin-bottom: 1.5rem;
}

/* IA */
.ia-section { display: flex; flex-direction: column; align-items: center; gap: 1rem; }

.btn-success {
  background: #2E7D32;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-success:hover:not(:disabled) { background: #1B5E20; }
.btn-success:disabled { opacity: 0.7; cursor: not-allowed; }

.ia-resultado {
  width: 100%;
  background: #e8f0fb;
  border-left: 4px solid var(--color-primary);
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
}

.ia-resultado h3 {
  color: var(--color-primary);
  font-size: 1rem;
  margin: 0 0 0.75rem;
}

.ia-resultado p {
  color: #333;
  line-height: 1.6;
  margin: 0;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .metricas-grid { grid-template-columns: repeat(2, 1fr); }
  .chart-container { height: 250px; }
}
</style>