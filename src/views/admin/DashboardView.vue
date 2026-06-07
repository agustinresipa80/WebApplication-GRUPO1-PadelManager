<template>
  <div class="page">
    <div class="page-header">
      <h1>Dashboard de Estadísticas</h1>
    </div>
    
    <p class="text-muted mb-4">Métricas principales de PadelManager.</p>
    <p v-if="errorMensaje" style="color: red; font-weight: bold;">{{ errorMensaje }}</p>

    <div class="chart-container shadow-sm border rounded">
      <Bar :data="chartData" :options="chartOptions" />
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

// Variable para atajar errores si se cae la base de datos
const errorMensaje = ref('')

const cargarEstadisticas = async () => {
  try {
    // 1. Llamada a la API
    const respuesta = await fetch(`${import.meta.env.VITE_MOCKAPI_URL}/Players`)
    if (!respuesta.ok) throw new Error('Error al conectar')
    
    const jugadores = await respuesta.json()

    // 2. Lógica para agrupar: clasificamos por nivel
    const conteo = { 'Principiante': 0, 'Intermedio': 0, 'Avanzado': 0 }
    
    jugadores.forEach(j => {
      if (j.level < 40) conteo['Principiante']++
      else if (j.level < 80) conteo['Intermedio']++
      else conteo['Avanzado']++
    })

    // Debug: Esto te ayuda a ver en la consola si el conteo es correcto
    console.log("Conteo final para el gráfico:", conteo)

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
</style>