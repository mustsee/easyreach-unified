<template>
  <div class="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Error State -->
    <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <p class="text-sm font-medium">{{ error }}</p>
    </div>

    <!-- Persistent Header: Stats & Date Picker -->
    <div class="mb-8">
      <div 
        class="rounded-3xl p-8 shadow-lg shadow-indigo-100 text-white flex items-center justify-between overflow-hidden relative transition-all duration-500"
        :class="[isDataLoaded ? 'opacity-100' : 'opacity-90']"
        :style="{ background: `linear-gradient(135deg, ${hostelStore.currentHostel?.color || '#5b51ff'}, ${hostelStore.currentHostel?.color ? hostelStore.currentHostel.color + 'dd' : '#4a42e0'})` }"
      >
        <div class="relative z-10 grid grid-cols-1 md:grid-cols-3 items-center w-full gap-8">
          <!-- Left: Bookings Count -->
          <div class="flex flex-col order-1 transition-all duration-500" :class="{ 'opacity-0 scale-95': !isDataLoaded }">
            <p class="flex justify-center text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Arrivals Summary</p>
            <div class="flex items-center justify-center gap-3">
              <h2 class="text-6xl font-black tracking-tighter leading-none">{{ isDataLoaded ? sortedArrivals.length : '0' }}</h2>
              <p class="text-white/90 font-bold uppercase text-[10px] tracking-widest leading-tight">Bookings<br/>Today</p>
            </div>
          </div>

          <!-- Center: Date Picker / Navigator & Refresh -->
          <div class="flex flex-col items-center gap-5 order-3 md:order-2">
            <div class="flex flex-col items-center gap-3">
              <div class="flex items-center gap-1 bg-black/10 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
                <button @click="goToPreviousDay" class="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                
                <div class="flex items-center gap-3 px-2">
                  <span class="text-sm font-bold tracking-tight min-w-[140px] text-center">{{ todayDisplay }}</span>
                </div>

                <button @click="goToNextDay" class="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
              
              <!-- Week Picker Overlay -->
              <div class="flex items-center gap-1 bg-black/10 p-1 rounded-2xl border border-white/5 backdrop-blur-sm">
                <button 
                  v-for="day in weekDays" 
                  :key="day.date.getTime()"
                  @click="selectedDate = day.date"
                  class="flex flex-col items-center justify-center w-11 h-14 rounded-xl transition-all duration-200"
                  :class="[
                    day.isSelected 
                      ? 'bg-white/20 text-white border border-white/15' 
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  ]"
                >
                  <span class="text-[9px] font-black tracking-widest uppercase mb-1">{{ day.dayName }}</span>
                  <div class="relative flex flex-col items-center justify-center">
                    <span class="text-base font-bold">{{ day.dayNumber }}</span>
                  </div>
                </button>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button 
                @click="resetToToday" 
                class="text-[9px] uppercase font-black tracking-widest bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors border border-white/5 backdrop-blur-md"
              >
                Back to Today
              </button>

              <button 
                v-if="isDataLoaded"
                @click="refreshArrivals" 
                :disabled="isLoading"
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all border border-white/5 disabled:opacity-50 text-[9px] uppercase font-black tracking-widest backdrop-blur-md"
              >
                <svg 
                  class="w-3 h-3" 
                  :class="{ 'animate-spin': isLoading }"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh Data
              </button>
            </div>
          </div>
          
          <!-- Right: Stats -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-6 sm:gap-10 order-2 md:order-3 md:pl-16 transition-all duration-500" :class="{ 'opacity-0 scale-95': !isDataLoaded }">
            <div class="flex flex-col gap-3 min-w-[180px] group/stat">
              <div class="flex items-end justify-between gap-4">
                <div class="flex flex-col gap-1">
                  <span class="text-[9px] font-bold text-white/40 uppercase tracking-[0.3em] pl-0.5">Progress</span>
                  <div class="flex items-baseline gap-1.5">
                    <span class="text-4xl font-black text-white leading-none tracking-tighter">{{ messageStats.sent }}</span>
                    <span class="text-base font-bold text-white/25">/ {{ messageStats.total }}</span>
                  </div>
                </div>
                <!-- Mini visual indicator box -->
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-xl group-hover/stat:border-white/20 transition-all duration-300">
                  <svg class="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <!-- Enhanced Progress Bar -->
              <div class="relative w-full h-3 bg-white/5 rounded-full border border-white/10 p-0.5 backdrop-blur-sm overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-white/80 to-white transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]" 
                  :style="{ width: `${messageStats.total > 0 ? (messageStats.sent / messageStats.total) * 100 : 0}%` }"
                ></div>
                <!-- Subtle grid lines pattern for precision look -->
                <div class="absolute inset-0 flex justify-around items-center px-2 pointer-events-none opacity-20">
                  <div class="w-[1px] h-1 bg-white/50"></div>
                  <div class="w-[1px] h-1 bg-white/50"></div>
                  <div class="w-[1px] h-1 bg-white/50"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="relative min-h-[400px]">
      <!-- Loading State -->
      <transition 
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="isLoading" class="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-20 rounded-2xl">
          <div class="relative">
            <div class="w-16 h-16 border-4 rounded-full opacity-20" :style="{ borderColor: hostelStore.currentHostel?.color || '#6366f1' }"></div>
            <div class="w-16 h-16 border-4 rounded-full border-t-transparent animate-spin absolute inset-0" :style="{ borderColor: hostelStore.currentHostel?.color || '#6366f1' }"></div>
          </div>
          <p class="mt-4 text-gray-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Fetching</p>
        </div>
      </transition>

      <!-- Initial State (Not Loaded) -->
      <div v-if="!isDataLoaded && !isLoading" class="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 px-6 text-center animate-fade-in">
        <p class="text-gray-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">Select a date above and click the button below to retrieve the guests list.</p>
        
        <button 
          @click="fetchArrivals"
          class="group relative inline-flex items-center justify-center px-8 py-4 font-black text-white transition-all duration-200 rounded-2xl focus:outline-none active:scale-95 border border-transparent hover:brightness-110 active:brightness-90"
          :style="{ 
            backgroundColor: hostelStore.currentHostel?.color || '#4f46e5',
            boxShadow: `0 10px 15px -3px ${hostelStore.currentHostel?.color || '#4f46e5'}40`
          }"
        >
          <span class="relative flex items-center gap-3">
            <svg class="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            <span class="uppercase tracking-widest text-sm">Load Guests List</span>
          </span>
        </button>
      </div>

      <!-- Empty State (Loaded but no results) -->
      <div v-else-if="isDataLoaded && !isLoading && arrivals.length === 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 px-6 text-center">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900">No arrivals found</h3>
        <p class="text-gray-500 mt-2 max-w-xs mx-auto font-medium">We couldn't find any bookings arriving on this date.</p>
        <button @click="fetchArrivals" class="mt-6 text-indigo-600 font-bold text-sm uppercase tracking-widest hover:text-indigo-700 transition-colors">Try Refreshing</button>
      </div>

      <!-- Loaded Content: List -->
      <div v-else-if="isDataLoaded && sortedArrivals.length > 0" class="animate-slide-up">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <!-- List Header -->
          <div 
            class="px-10 py-5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] border-b border-gray-50 bg-gray-50/50"
            :style="{ 
              color: hostelStore.currentHostel?.color || '#9ca3af'
            }"
          >
            <div class="flex-1 opacity-70">Guest</div>
            <div class="flex items-center gap-8">
              <div class="w-[180px] text-center opacity-70">Phone</div>
              <div class="w-[200px] text-center opacity-70">Arrival</div>
              <div class="w-[140px] text-center opacity-70">Status</div>
              <div class="w-6"></div>
            </div>
          </div>

          <ArrivalCard 
            v-for="(booking, index) in sortedArrivals" 
            :key="booking.bookId"
            :booking="booking"
            :messages="messages"
            :hostel-settings="hostelSettings"
            :room-mappings="roomMappings"
            :is-last="index === sortedArrivals.length - 1"
            :arrival-date="todayYYYYMMDD"
            @status-updated="handleStatusUpdated"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, h } from 'vue';
import { useHostelStore } from '../stores/hostel';
import { loadHostelSettings, loadMessages, loadRoomMappings } from '../services/messageService';
import { fetchBookings, updateBooking } from '../services/beds24Service';
import { getArrivalsDoc, saveArrivals, loadArrivalsFromFirestore, syncArrivals } from '../services/arrivalsService';
import { getCheckinTime, getMessageType } from '../utils/helpers';
import ArrivalCard from '../components/ArrivalCard.vue';
import { toast } from 'vue3-toastify';

const hostelStore = useHostelStore();
const arrivals = ref([]);
const messages = ref([]);
const hostelSettings = ref({});
const roomMappings = ref([]);
const isLoading = ref(false);
const isDataLoaded = ref(false);
const error = ref(null);
const cachedAt = ref(null);

const getInitialDate = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0); // Normalize to start of day
  d.setDate(d.getDate() + 2);
  return d;
};

const selectedDate = ref(getInitialDate());

const goToPreviousDay = () => {
  const d = new Date(selectedDate.value);
  d.setDate(d.getDate() - 7);
  selectedDate.value = d;
};

const goToNextDay = () => {
  const d = new Date(selectedDate.value);
  d.setDate(d.getDate() + 7);
  selectedDate.value = d;
};

const resetToToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  selectedDate.value = d;
};

const todayDisplay = computed(() => {
  return selectedDate.value.toLocaleDateString('en-GB', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});

const todayYYYYMMDD = computed(() => {
  const y = selectedDate.value.getFullYear();
  const m = String(selectedDate.value.getMonth() + 1).padStart(2, '0');
  const d = String(selectedDate.value.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
});

const sortedArrivals = computed(() => {
  return arrivals.value
    .filter(booking => booking.status === 1 || booking.status === 2 || booking.status === '1' || booking.status === '2')
    .map(booking => {
      const checkinTime = getCheckinTime(booking.guestComments, booking.referer);
      const messageType = getMessageType(
        booking.guestComments, 
        booking.referer, 
        booking.guestPhone || booking.guestMobile, 
        booking.guestEmail
      );

      const masterId = booking.masterId;
      const bookId = booking.bookId;
      const group = booking.group || {};
      
      return {
        ...booking,
        calculatedCheckinTime: checkinTime,
        messageType: messageType,
        groupReservation: !!masterId,
        isMasterReservation: !!(masterId && masterId === bookId),
        personsInGroup: (masterId && masterId === bookId) ? (Object.keys(group).length + 1) : null
      };
    })
    .filter(booking => {
      // If it's a sub-booking (part of a group but not the master), we hide it from the arrivals list
      if (booking.groupReservation && !booking.isMasterReservation) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const nameA = (a.guestName || '').toLowerCase();
      const nameB = (b.guestName || '').toLowerCase();
      return nameA.localeCompare(nameB, 'en', { sensitivity: 'base' });
    });
});

const weekDays = computed(() => {
  const days = [];
  // Find Monday of the currently selected week
  const date = new Date(selectedDate.value);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  
  const todayStr = new Date().toDateString();
  const selectedStr = selectedDate.value.toDateString();
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({
      date: new Date(d),
      dayName: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      dayNumber: d.getDate(),
      isToday: d.toDateString() === todayStr,
      isSelected: d.toDateString() === selectedStr
    });
  }
  return days;
});
 
const messageStats = computed(() => {
  return sortedArrivals.value.reduce((acc, booking) => {
    acc.total++;
    if (booking.messagingStatus === 'done') {
      acc.sent++;
    }
    return acc;
  }, { sent: 0, total: 0 });
});

/**
 * Loads hostel config (settings, messages, room mappings).
 * Called before any fetch/refresh.
 */
const loadHostelConfig = async () => {
  const settings = await loadHostelSettings(hostelStore.currentHostel.id);
  
  if (!settings.beds24ApiKey || !settings.propKey) {
    error.value = 'Beds24 API credentials not configured. Please go to Settings.';
    return null;
  }

  hostelSettings.value = settings;
  messages.value = await loadMessages(hostelStore.currentHostel.id);
  roomMappings.value = await loadRoomMappings(hostelStore.currentHostel.id);
  
  return settings;
};

/**
 * Normalizes raw Beds24 API response into an array of bookings.
 */
const normalizeBeds24Data = (data) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
};

/**
 * Processes Hostelworld bookings directly after fetch to flag them in Beds24
 * as "HW automatic email sent" if not already present.
 */
const handleHostelworldBookings = async (bookings, apiKey, propKey) => {
  const updatedBookings = [...bookings];
  
  const hwPromises = updatedBookings.map(async (booking) => {
    if (booking.referer === 'Hostelworld.com') {
      const currentArrivalTime = booking.guestArrivalTime || '';
      
      if (!currentArrivalTime.includes('HW automatic email sent')) {
        const newArrivalTime = currentArrivalTime
          ? `HW automatic email sent - ${currentArrivalTime}`
          : 'HW automatic email sent';
          
        try {
          await updateBooking(apiKey, propKey, booking.bookId, {
            guestArrivalTime: newArrivalTime
          });
          booking.guestArrivalTime = newArrivalTime;
        } catch (err) {
          console.error(`Failed to update Beds24 for HW booking ${booking.bookId}:`, err);
        }
      }
    }
  });

  await Promise.all(hwPromises);
  return updatedBookings;
};

/**
 * First-load flow:
 * 1. Check Firestore for cached data
 * 2. If found → use cached data (no Beds24 call)
 * 3. If not found → fetch from Beds24, save to Firestore
 */
const fetchArrivals = async () => {
  if (!hostelStore.currentHostel?.id) return;
  
  isLoading.value = true;
  error.value = null;
  cachedAt.value = null;
  
  try {
    const settings = await loadHostelConfig();
    if (!settings) {
      isLoading.value = false;
      return;
    }

    const hostelId = hostelStore.currentHostel.id;
    const dateStr = todayYYYYMMDD.value;

    // Check if we already have data in Firestore
    const existingDoc = await getArrivalsDoc(hostelId, dateStr);

    if (existingDoc) {
      // Load from Firestore cache
      const cachedBookings = await loadArrivalsFromFirestore(hostelId, dateStr);
      arrivals.value = cachedBookings;
      cachedAt.value = new Date(existingDoc.fetchedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } else {
      // First time: fetch from Beds24 and save to Firestore
      const data = await fetchBookings(settings.beds24ApiKey, settings.propKey, dateStr, dateStr);
      let bookings = normalizeBeds24Data(data);
      
      if (settings.autoHandleHostelworld !== false) {
        bookings = await handleHostelworldBookings(bookings, settings.beds24ApiKey, settings.propKey);
      }
      
      // Save to Firestore with messagingStatus = "todo"
      const savedBookings = await saveArrivals(hostelId, dateStr, bookings, settings.autoHandleHostelworld !== false);
      arrivals.value = savedBookings;
      cachedAt.value = null; // Fresh data, no cache indicator
      console.log('Fetched from Beds24 and saved to Firestore:', bookings.length);
    }

    isDataLoaded.value = true;
  } catch (err) {
    console.error('Failed to fetch arrivals:', err);
    error.value = 'Failed to load arrivals. Please check your API keys and connection.';
    toast.error('Failed to fetch arrivals');
  } finally {
    isLoading.value = false;
  }
};

/**
 * Refresh flow (Refresh button):
 * Always re-fetches from Beds24 and syncs with Firestore.
 * Preserves messaging statuses of existing bookings.
 */
const refreshArrivals = async () => {
  if (!hostelStore.currentHostel?.id) return;
  
  isLoading.value = true;
  error.value = null;
  
  try {
    const settings = await loadHostelConfig();
    if (!settings) {
      isLoading.value = false;
      return;
    }

    const hostelId = hostelStore.currentHostel.id;
    const dateStr = todayYYYYMMDD.value;

    // Always fetch fresh from Beds24
    const data = await fetchBookings(settings.beds24ApiKey, settings.propKey, dateStr, dateStr);
    let freshBookings = normalizeBeds24Data(data);

    if (settings.autoHandleHostelworld !== false) {
      freshBookings = await handleHostelworldBookings(freshBookings, settings.beds24ApiKey, settings.propKey);
    }

    // Sync with Firestore (add new, remove cancelled, preserve statuses)
    const stats = await syncArrivals(hostelId, dateStr, freshBookings, settings.autoHandleHostelworld !== false);

    // Reload from Firestore to get the merged result
    const mergedBookings = await loadArrivalsFromFirestore(hostelId, dateStr);
    arrivals.value = mergedBookings;
    cachedAt.value = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    toast.success('Synced', { autoClose: 3000 });
    console.log('Refresh sync complete:', stats);
  } catch (err) {
    console.error('Failed to refresh arrivals:', err);
    error.value = 'Failed to refresh arrivals.';
    toast.error('Failed to refresh arrivals');
  } finally {
    isLoading.value = false;
  }
};

/**
 * Handles status-updated event from ArrivalCard.
 * Updates the local booking's messagingStatus reactively.
 */
const handleStatusUpdated = ({ bookId, messagingStatus, messagingChannel, guestArrivalTime }) => {
  const booking = arrivals.value.find(b => String(b.bookId) === String(bookId));
  if (booking) {
    booking.messagingStatus = messagingStatus;
    booking.messagingChannel = messagingChannel;
    booking.messagingUpdatedAt = new Date().toISOString();
    
    if (guestArrivalTime !== undefined) {
      booking.guestArrivalTime = guestArrivalTime;
    }
  }
};

/**
 * Checks Firestore for cached data and auto-loads if available.
 * If no cached data, resets to the "Load Guests List" state.
 */
const tryAutoLoad = async () => {
  isDataLoaded.value = false;
  arrivals.value = [];
  cachedAt.value = null;
  error.value = null;

  if (!hostelStore.currentHostel?.id) return;

  try {
    const hostelId = hostelStore.currentHostel.id;
    const dateStr = todayYYYYMMDD.value;

    const existingDoc = await getArrivalsDoc(hostelId, dateStr);

    if (existingDoc) {
      isLoading.value = true;

      // Load hostel config for message templates etc.
      await loadHostelConfig();

      const cachedBookings = await loadArrivalsFromFirestore(hostelId, dateStr);
      arrivals.value = cachedBookings;
      cachedAt.value = new Date(existingDoc.fetchedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      isDataLoaded.value = true;
      isLoading.value = false;
    }
    // If no cached data, do nothing — user will see "Load Guests List" button
  } catch (err) {
    console.error('Error during auto-load check:', err);
    isLoading.value = false;
  }
};

watch([() => hostelStore.currentHostel?.id, selectedDate], () => {
  tryAutoLoad();
});

onMounted(() => {
  tryAutoLoad();
});

// Define icons for summary card
const WhatsAppIcon = {
  render() {
    return h('svg', { viewBox: "0 0 24 24", fill: "currentColor" }, [
      h('path', { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" })
    ]);
  }
};
 
const EmailIcon = {
  render() {
    return h('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, [
      h('path', { d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" })
    ]);
  }
};
</script>

<style scoped>
.group:hover {
  transform: translateY(-2px);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-slide-up {
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Custom Scrollbar for better aesthetics */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>