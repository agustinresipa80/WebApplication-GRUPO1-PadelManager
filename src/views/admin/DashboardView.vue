<template>
  <div class="page">
    <div class="page-header">
      <h1>Dashboard de Estadísticas</h1>
    </div>
    
    <p class="text-muted mb-4">Métricas principales de PadelManager.</p>

    <div class="chart-container shadow-sm border rounded">
      <Bar :data="chartData" :options="chartOptions" />
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
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

// Datos falsos (Mock) para probar el gráfico
const chartData = ref({
  labels: ['1ra', '2da', '3ra', '4ta', '5ta', '6ta'],
  datasets: [
    {
      label: 'Parejas Inscriptas por Categoría',
      backgroundColor: '#0d6efd', // Azul PadelManager
      borderRadius: 4,
      data: [4, 8, 12, 16, 10, 6] 
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