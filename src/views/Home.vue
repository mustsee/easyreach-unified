<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const handleLogin = () => {
  authStore.loginWithGoogle()
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-white font-sans">
    <!-- Header -->
    <header class="h-16 bg-[#1a202c] flex items-center px-6">
      <div class="flex items-center">
        <div class="w-1 h-6 bg-gray-400 mr-3 rounded-sm"></div>
        <span class="text-white font-semibold text-lg tracking-tight">Easy Reach</span>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center">
      <button 
        @click="handleLogin" 
        :disabled="!authStore.isAuthReady"
        class="flex items-center gap-3 bg-white border border-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        <span class="font-semibold text-[15px]">Sign in with Google</span>
      </button>
    </main>

    <!-- Footer -->
    <footer class="h-12 bg-[#1a202c] flex items-center justify-center">
      <span class="text-gray-300 text-sm font-medium">2026</span>
    </footer>
  </div>
</template>

