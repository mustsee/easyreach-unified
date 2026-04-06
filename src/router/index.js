import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Arrivals from '../views/Arrivals.vue'
import Settings from '../views/Settings.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/arrivals',
      name: 'arrivals',
      component: Arrivals,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      meta: { requiresAuth: true }
    }
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthReady) {
    await authStore.authReadyPromise
  }

  if (to.meta.requiresAuth && !authStore.isAuthorized) {
    return '/'
  } else if (to.path === '/' && authStore.isAuthorized) {
    return '/arrivals'
  }
})

export default router
