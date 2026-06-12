<template>
  <div class="page">
    <div class="page-header">
      <h1>Dashboard de Estadísticas</h1>
    </div>
    
    <p class="text-muted mb-4">Métricas principales de PadelManager.</p>
    <p v-if="errorMensaje" style="color: red; font-weight: bold;">{{ errorMensaje }}</p>
    <div v-if="cargando" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-2 text-muted" style="font-weight: 500;">Trayendo datos de los jugadores...</p>
    </div>

<div v-else class="chart-container shadow-sm border rounded">
        <Bar :data="chartData" :options="chartOptions" />
    </div>
<div v-if="!cargando && !errorMensaje" class="mt-5 text-center">
      <button 
        @click="generarAnalisisIA" 
        class="btn btn-success btn-lg shadow-sm" 
        :disabled="cargandoIA"
        title="Obtiene un consejo basado en los datos actuales"
      >
        <span v-if="cargandoIA" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
         Generar Análisis Estratégico con IA
      </button>

      <div v-if="analisisIA" class="alert alert-info mt-4 text-start shadow-sm border-0 border-start border-4 border-primary bg-light">
        <h5 class="alert-heading text-primary">Recomendación de PadelManager AI</h5>
        <hr>
        <p class="mb-0" style="font-size: 1.1rem; line-height: 1.5;">{{ analisisIA }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { 
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  BarElement, 
  CategoryScale, 
  LinearScale 
} from 'chart.js'

// Registramos los módulos de Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

// // Datos que se van a llenar dinámicamente con MockAPI
const chartData = ref({
  labels: [], // Lo vaciamos
  datasets: [
    {
      label: 'Parejas Inscriptas por Categoría',
      backgroundColor: '#0d6efd',
      borderRadius: 4,
      data: [] // Lo vaciamos
    }
  ]
})

// Opciones de diseño del gráfico
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' }
  }
})

// Variable para controlar el spinner (AGREGAR ESTA LÍNEA)
const cargando = ref(true)

// Variable para atajar errores si se cae la base de datos
const errorMensaje = ref('')
const API_URL = `${import.meta.env.VITE_API_URL}/Players` 
// --- VARIABLES PARA LA IA ---
const datosConteo = ref({}) 
const analisisIA = ref('')
const cargandoIA = ref(false)

const cargarEstadisticas = async () => {
 cargando.value = true
  try {
    // 1. Llamada a la API
    const respuesta = await fetch(API_URL)
    if (!respuesta.ok) throw new Error('Error al conectar')
    
    const jugadores = await respuesta.json()
 if (jugadores.length === 0) throw new Error('No hay jugadores inscriptos todavía.')
    // 2. Lógica para agrupar: clasificamos por nivel
    const conteo = { 'Principiante': 0, 'Intermedio': 0, 'Avanzado': 0 }
    
    jugadores.forEach(j => {
      if (j.level < 40) conteo['Principiante']++
      else if (j.level < 80) conteo['Intermedio']++
      else conteo['Avanzado']++
    })

    datosConteo.value = conteo // AGREGAMOS ESTO PARA LA IA

    // 3. Asignación de datos al gráfico
    // Usamos esta forma para asegurar que Vue detecte el cambio y actualice el gráfico
    chartData.value = {
      ...chartData.value,
      labels: Object.keys(conteo),
      datasets: [{
        ...chartData.value.datasets[0],
        data: Object.values(conteo)
      }]
    }
    
  } catch (error) {
    console.error("Error al traer datos:", error)
    errorMensaje.value = 'No se pudieron cargar las estadísticas. Revisa la conexión al servidor.'
  } finally {
    cargando.value = false
}
}
// --- FUNCIÓN DE IA ---
const generarAnalisisIA = async () => {
  if (Object.keys(datosConteo.value).length === 0) return 

  cargandoIA.value = true
  analisisIA.value = '' 

  try {
    const prompt = `Actúa como un experto administrador de clubes de pádel. Aquí tienes la cantidad de jugadores inscriptos por nivel: Principiantes: ${datosConteo.value['Principiante']}, Intermedios: ${datosConteo.value['Intermedio']}, Avanzados: ${datosConteo.value['Avanzado']}. Dame una recomendación estratégica corta (máximo 3 renglones) sobre qué tipo de torneo, clínica o promoción debería organizar este fin de semana para maximizar las ganancias.`

    const respuesta = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // <--- ACÁ ESTABA EL ERROR. Usamos el modelo actualizado.
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    })

    // Agregamos esto para ver el error real si llega a fallar de nuevo
    if (!respuesta.ok) {
        const errorDetail = await respuesta.json()
        console.error("Detalle del error de Groq:", errorDetail)
        throw new Error('Fallo en la comunicación con Groq')
    }

    const data = await respuesta.json()
    analisisIA.value = data.choices[0].message.content

  } catch (error) {
    console.error("Error IA:", error)
    analisisIA.value = 'No se pudo generar el consejo inteligente en este momento. Intente más tarde.'
  } finally {
    cargandoIA.value = false
  }
}
// Ejecutamos la función apenas el componente se monta en pantalla

onMounted(() => {
  cargarEstadisticas()
})
</script>

<style scoped>
/* Respetamos las clases globales de tu equipo */
.page { 
  padding: 2rem; 
  max-width: 1100px; 
  margin: 0 auto; 
}
.page-header h1 { 
  font-size: 1.8rem; 
  color: var(--color-primary); 
  margin: 0 0 1rem; 
}

/* Le damos un alto fijo al contenedor del gráfico para que no se deforme */
.chart-container {
  height: 400px;
  width: 100%;
  max-width: 700px;
  background-color: white;
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .chart-container {
    height: 300px;
    padding: 1rem;
  }
  .page {
    padding: 1rem;
  }
}
</style>