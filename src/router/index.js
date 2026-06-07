import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/torneo/:id/fixture',
    name: 'Fixture',
    component: () => import('@/views/FixtureView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/perfil',
    name: 'Perfil',
    component: () => import('@/views/PerfilView.vue'),
    meta: { requiresAuth: true }
  },
  // ── Rutas de admin ──
  {
    path: '/admin/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/admin/DashboardView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/torneos',
    name: 'AdminTorneos',
    component: () => import('@/views/admin/TorneosView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/jugadores',
    name: 'AdminJugadores',
    component: () => import('@/views/admin/JugadoresView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/partidos',
    name: 'AdminPartidos',
    component: () => import('@/views/admin/PartidosView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  // Catch-all
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  // Necesitamos acceder al store DESPUÉS de que Pinia esté montado
  const authStore = useAuthStore()


 
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next({ name: 'Login' })
  }

  if (to.meta.requiresGuest && authStore.isLoggedIn) {
    return next({ name: 'Home' })
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next({ name: 'Home' })
  }

  next()
})

export default router
