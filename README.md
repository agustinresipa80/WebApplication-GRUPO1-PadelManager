# 🎾 PadelManager

Plataforma web para la gestión de torneos de pádel amateur.  
Trabajo Práctico Final — Programación en Nuevas Tecnologías 2

## Stack

- Vue 3 + Composition API
- Vue Router 4 (con navigation guards por rol)
- Pinia (estado global / auth)
- MockAPI.io (fake REST API)
- Chart.js + vue-chartjs (dashboard)
- Groq API — Llama 3.1 70B (funcionalidades IA)

## Setup

```bash
# 1. Clonar el repo
git clone https://github.com/TU_USUARIO/padelmanager.git
cd padelmanager

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu URL de API y API key de Groq

# 4. Correr en desarrollo
npm run dev
```

## Variables de entorno

```
VITE_API_URL=https://TU_PROJECT_ID.mockapi.io
VITE_GROQ_API_KEY=tu_api_key
```

## Estructura del proyecto

```
src/
├── assets/         # Estilos globales
├── components/     # Componentes reutilizables (NavBar, etc.)
├── composables/    # Lógica reutilizable (fetch hooks)
├── router/         # Vue Router + navigation guards
├── stores/         # Pinia stores (auth)
└── views/
    ├── LoginView.vue
    ├── HomeView.vue
    ├── FixtureView.vue
    ├── PerfilView.vue
    └── admin/
        ├── DashboardView.vue
        ├── TorneosView.vue
        ├── JugadoresView.vue
        └── PartidosView.vue
```

## Usuarios de prueba (cargar en MockAPI)

| Email | Password | Rol |
|---|---|---|
| admin@padel.com | admin123 | admin |
| jugador@padel.com | jugador123 | player |

## Integrantes

| Nombre | Responsabilidad |
|---|---|
| Integrante 1 | Arquitectura, Router, Auth, NavBar |
| Integrante 2 | API, ABM Torneos, ABM Jugadores |
| Integrante 3 | ABM Partidos, Fixture, Perfil |
| Integrante 4 | Dashboard, Integración IA, Estilos |
