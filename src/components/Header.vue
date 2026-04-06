<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getDocuments } from '../services/firestoreService'
import { where } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth'
import { useHostelStore } from '../stores/hostel'

const authStore = useAuthStore()
const hostelStore = useHostelStore()
const route = useRoute()

const currentSender = computed({
  get: () => hostelStore.currentSender,
  set: (val) => hostelStore.currentSender = val
})
const isMenuOpen = ref(false)

const hostelColor = computed(() => hostelStore.currentHostel?.color || 'rgb(219, 234, 254)')

const senderInitial = computed(() => {
  return currentSender.value ? currentSender.value.charAt(0).toUpperCase() : '?'
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

watch(() => hostelStore.currentHostel, () => { 
  closeMenu()
}, { deep: true })

watch(() => route.path, (newPath) => { 
  closeMenu()
})
</script>

<template>
  <header class="flex flex-col w-full relative z-50">
    <!-- Main navbar row -->
    <div class="flex justify-between items-center px-4 md:px-6 h-16 bg-dark-bg">
      <!-- Left: Logo + Desktop Navigation -->
      <div class="flex items-center gap-4 lg:gap-6">
        <!-- Logo -->
        <div class="flex items-center">
          <div class="w-1 h-6 bg-gray-400 mr-3 rounded-sm"></div>
          <span class="font-semibold text-lg text-text-white tracking-tight">Easy Reach</span>
        </div>

        <!-- Desktop Navigation Items (Hidden on Mobile) -->
        <div class="hidden lg:flex items-center gap-6">
          <!-- Separator -->
          <div class="w-px h-5 bg-white/10"></div>

          <!-- Hostel pills -->
          <div class="flex items-center gap-1">
            <button
              v-for="hostel in hostelStore.hostels"
              :key="hostel.id"
              @click="hostelStore.setHostel(hostel.id)"
              class="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[14px] font-medium transition-all duration-200 cursor-pointer border-none outline-none"
              :class="hostelStore.currentHostel.id === hostel.id
                ? 'bg-white/10 text-text-white'
                : 'bg-transparent text-text-muted hover:text-text-white hover:bg-white/5'"
            >
              <span
                class="w-2 h-2 rounded-full shrink-0 transition-all duration-200"
                :style="{ backgroundColor: hostelStore.currentHostel.id === hostel.id ? hostel.color : 'rgba(255,255,255,0.25)' }"
              ></span>
              {{ hostel.shortName }}
            </button>
          </div>

          <!-- Nav links -->
          <nav class="flex gap-2">
            <router-link to="/arrivals" class="no-underline text-text-muted text-[15px] font-medium px-4 py-2 rounded-md transition-colors hover:text-text-white [&.router-link-active]:bg-nav-bg [&.router-link-active]:text-text-white">Arrivals</router-link>
            <router-link to="/settings" class="no-underline text-text-muted text-[15px] font-medium px-4 py-2 rounded-md transition-colors hover:text-text-white [&.router-link-active]:bg-nav-bg [&.router-link-active]:text-text-white">Settings</router-link>
          </nav>
        </div>
      </div>

      <!-- Right: Desktop sender/signout + Mobile Hamburger Toggle -->
      <div class="flex items-center gap-4">
        <!-- Desktop Only: Right Side Elements -->
        <div class="hidden lg:flex items-center gap-4">
          <template v-if="route.path === '/arrivals'">
            <span class="text-text-muted text-[14px]">You are sending as</span>

            <div class="relative flex items-center gap-2 group">
              <!-- Sender avatar -->
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition-colors duration-300 shrink-0"
                :style="{
                  backgroundColor: hostelColor,
                  color: '#fff'
                }"
              >
                {{ senderInitial }}
              </div>

              <!-- Sender select -->
              <div class="relative">
                <select
                  v-model="hostelStore.currentSender"
                  class="appearance-none bg-transparent border-none text-text-white text-[15px] font-medium outline-none cursor-pointer pr-5 py-0"
                >
                  <option v-if="hostelStore.senders.length === 0" value="" disabled>Loading...</option>
                  <option v-for="sender in hostelStore.senders" :key="sender.id" :value="sender.name" class="bg-[#1e2d45] text-white">
                    {{ sender.name }}
                  </option>
                </select>
                <div class="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-x-transparent border-t-text-muted pointer-events-none"></div>
              </div>
            </div>
          </template>

          <button
            class="bg-transparent border-none text-text-muted text-[15px] font-medium cursor-pointer p-2 transition-colors hover:text-text-white"
            @click="authStore.logout()"
          >Sign out</button>
        </div>

        <!-- Mobile Hamburger Button -->
        <button 
          @click="toggleMenu"
          class="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 focus:outline-none bg-transparent border-none cursor-pointer"
          aria-label="Toggle menu"
        >
          <div 
            class="w-6 h-0.5 bg-gray-300 transition-all duration-300 rounded-full"
            :class="{ 'rotate-45 translate-y-2': isMenuOpen }"
          ></div>
          <div 
            class="w-6 h-0.5 bg-gray-300 transition-all duration-300 rounded-full"
            :class="{ 'opacity-0': isMenuOpen }"
          ></div>
          <div 
            class="w-6 h-0.5 bg-gray-300 transition-all duration-300 rounded-full"
            :class="{ '-rotate-45 -translate-y-2': isMenuOpen }"
          ></div>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform -translate-y-full opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-full opacity-0"
    >
      <div 
        v-if="isMenuOpen"
        class="lg:hidden absolute top-16 left-0 right-0 bg-dark-bg border-t border-white/5 shadow-2xl flex flex-col p-6 gap-8 overflow-y-auto max-h-[calc(100vh-64px)]"
      >
        <!-- Mobile Hostel Selection -->
        <div class="flex flex-col gap-3">
          <span class="text-text-muted text-xs font-semibold uppercase tracking-wider">Select Hostel</span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="hostel in hostelStore.hostels"
              :key="hostel.id"
              @click="hostelStore.setHostel(hostel.id)"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-200 cursor-pointer border-none outline-none"
              :class="hostelStore.currentHostel.id === hostel.id
                ? 'bg-white/10 text-text-white ring-1 ring-white/20'
                : 'bg-white/5 text-text-muted'"
            >
              <span
                class="w-2.5 h-2.5 rounded-full shrink-0"
                :style="{ backgroundColor: hostelStore.currentHostel.id === hostel.id ? hostel.color : 'rgba(255,255,255,0.2)' }"
              ></span>
              {{ hostel.shortName }}
            </button>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <div class="flex flex-col gap-3">
          <span class="text-text-muted text-xs font-semibold uppercase tracking-wider">Navigation</span>
          <nav class="flex flex-col gap-2">
            <router-link to="/arrivals" class="no-underline text-text-muted text-lg font-medium px-4 py-3 rounded-xl transition-colors hover:text-text-white bg-white/5 [&.router-link-active]:bg-nav-bg [&.router-link-active]:text-text-white">Arrivals</router-link>
            <router-link to="/settings" class="no-underline text-text-muted text-lg font-medium px-4 py-3 rounded-xl transition-colors hover:text-text-white bg-white/5 [&.router-link-active]:bg-nav-bg [&.router-link-active]:text-text-white">Settings</router-link>
          </nav>
        </div>

        <!-- Mobile Sender Selection (if applicable) -->
        <div v-if="route.path === '/arrivals'" class="flex flex-col gap-3">
          <span class="text-text-muted text-xs font-semibold uppercase tracking-wider">Sending As</span>
          <div class="flex items-center gap-4 bg-white/5 p-4 rounded-xl ring-1 ring-white/5">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold shrink-0"
              :style="{
                backgroundColor: hostelColor,
                color: '#fff'
              }"
            >
              {{ senderInitial }}
            </div>
            <div class="flex-1 relative">
              <select
                v-model="hostelStore.currentSender"
                class="w-full appearance-none bg-transparent border-none text-text-white text-lg font-medium outline-none cursor-pointer pr-8"
              >
                <option v-if="hostelStore.senders.length === 0" value="" disabled>Loading...</option>
                <option v-for="sender in hostelStore.senders" :key="sender.id" :value="sender.name" class="bg-[#1e2d45] text-white">
                  {{ sender.name }}
                </option>
              </select>
              <div class="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[7px] border-x-transparent border-t-text-muted pointer-events-none"></div>
            </div>
          </div>
        </div>

        <!-- Mobile Sign Out -->
        <div class="pt-4 mt-auto border-t border-white/10">
          <button
            class="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-base font-semibold cursor-pointer py-4 rounded-xl transition-all"
            @click="authStore.logout()"
          >
            Sign out
          </button>
        </div>
      </div>
    </Transition>

    <!-- Colored band -->
    <div
      class="h-[3px] w-full transition-all duration-500 relative z-50"
      :style="{ backgroundColor: hostelColor }"
    ></div>
  </header>
</template>

