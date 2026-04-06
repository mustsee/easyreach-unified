<script setup>
import Header from './components/Header.vue'
import { useAuthStore } from './stores/auth'
import './assets/app.css'

const authStore = useAuthStore()
</script>

<template>
  <div v-if="!authStore.isAuthReady" class="flex items-center justify-center h-screen">
    Loading...
  </div>
  <div v-else class="min-h-screen w-full">
    <Header v-if="authStore.isAuthorized" />
    <main :class="[authStore.isAuthorized ? 'py-6' : '']">
      <router-view />
    </main>
  </div>
</template>
