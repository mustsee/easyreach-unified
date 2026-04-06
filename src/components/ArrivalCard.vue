<template>
  <div 
    class="transition-all duration-300 relative bg-white"
    :class="[
      isExpanded 
        ? 'shadow-xl shadow-gray-200/40 z-10 rounded-2xl my-4 border border-gray-200 ring-4 ring-gray-50' 
        : (!isLast ? 'border-b border-gray-100' : 'border-b border-transparent')
    ]"
  >
    <!-- Card Header -->
    <div 
      @click="isExpanded = !isExpanded"
      class="px-10 py-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/20 transition-colors"
    >
      <div class="flex items-center gap-4 flex-1">
        <!-- Guest Info Header Group -->
        <div class="flex flex-row items-center gap-4">
          <!-- Avatar -->
          <div 
            class="w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm tracking-widest shrink-0 uppercase shadow-sm transition-colors duration-300"
            :class="avatarClasses"
          >
            {{ (booking.guestFirstName?.[0] || '') + (booking.guestName?.[0] || '') }}
          </div>
          <div class="flex flex-col justify-center gap-0.5">
            <h3 class="text-xl font-semibold text-gray-800 leading-tight tracking-tight capitalize">
              {{ [booking.guestFirstName, booking.guestName].filter(Boolean).join(' ').toLowerCase() }}
            </h3>
            <span 
              v-if="booking.groupReservation && booking.personsInGroup" 
              class="w-fit inline-flex items-center gap-1 font-bold text-gray-500 uppercase tracking-wider text-[9px]"
            >
              <svg class="w-2.5 h-2.5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              {{ booking.personsInGroup }} Guests
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-8">
        <!-- Phone Number -->
        <div class="w-[180px] flex items-center justify-center gap-2">
          <span class="text-xs font-medium text-gray-500 tracking-tight truncate">
            {{ booking.guestPhone || booking.guestMobile || '-' }}
          </span>
          <button 
            v-if="booking.guestPhone || booking.guestMobile"
            @click.stop="copyPhone"
            class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all shrink-0"
            title="Copy phone number"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        <!-- Arrival Time -->
        <div class="flex items-center justify-between w-[200px]">
          <div class="w-[160px] flex items-center justify-center">
            <span class="text-center text-xs font-medium text-gray-700 tracking-tight">
              {{ booking.guestArrivalTime || '-' }}
            </span>
          </div>
          <div class="w-[40px] flex items-center justify-center">
            <button 
              @click.stop="startEditingTime"
              class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all shrink-0"
              title="Edit arrival time"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        </div>
 
        <!-- Status Badge (includes channel when sent) -->
        <span 
          class="px-4 py-1.5 rounded-full text-xs font-bold tracking-tight border w-[140px] text-center shrink-0 flex items-center justify-center gap-1.5"
          :class="getStatusClass(booking.messagingStatus)"
        >
          <WhatsAppIcon v-if="booking.messagingStatus === 'done' && booking.messagingChannel === 'whatsapp'" class="w-3.5 h-3.5" />
          <EmailIcon v-if="booking.messagingStatus === 'done' && booking.messagingChannel === 'email'" class="w-3.5 h-3.5" />
          {{ getStatusLabel(booking.messagingStatus, booking.messagingChannel) }}
        </span>
 
        <!-- Caret icon -->
        <svg 
          class="w-6 h-6 text-gray-400 transition-transform duration-300"
          :class="{ 'rotate-180': isExpanded }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>

    <!-- Expanded Content -->
    <div 
      v-if="isExpanded"
      class="border-t border-gray-100 px-10 py-8"
    >
      <div class="flex flex-col md:flex-row gap-12">
        <!-- LEFT COLUMN: Guest Info -->
        <div class="md:w-[40%] space-y-6">
          
          <div>
            <div class="space-y-1">
              <p class="text-[13px] text-gray-500 font-medium">{{ booking.guestPhone || booking.guestMobile || 'No phone provided' }}</p>
              <p class="text-[13px] text-gray-500 font-medium break-all">{{ booking.guestEmail || 'No email provided' }}</p>
            </div>
          </div>

          <hr class="border-gray-100" />

          <div class="space-y-4">
            <div class="space-y-1 relative w-fit">
              <p class="text-sm font-bold text-gray-800">Arrival time</p>
              <div class="flex items-center gap-1">
                <p class="text-[13px] text-gray-600 font-medium">
                  {{ booking.guestArrivalTime || 'N/A' }}
                </p>
                <button 
                  @click.stop="startEditingTime"
                  class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all shrink-0 -ml-1"
                  title="Edit arrival time"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="space-y-1">
              <p class="text-sm font-bold text-gray-800">Comments</p>
              <p class="text-[13px] text-gray-600 font-medium leading-relaxed leading-5">
                {{ booking.guestComments || 'None' }}
                <br />
                <span v-if="booking.guestComments?.toLowerCase().includes('smoke')" class="text-gray-500">Non Smoking Requested</span>
              </p>
            </div>

            <div class="space-y-1">
              <p class="text-sm font-bold text-gray-800">Referer</p>
              <p class="text-[13px] text-gray-600 font-medium capitalize">{{ booking.referer || 'Unknown' }}</p>
            </div>
          </div>

          <!-- Error State -->
          <div v-if="booking.messagingStatus === 'error'" class="mt-6 flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-100 text-[#c94b4b]">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p class="text-[11px] font-bold">Message delivery failed</p>
          </div>
        </div>

        <!-- RIGHT COLUMN: Message Composition -->
        <div class="md:w-[60%] space-y-6">
          <!-- Type Dropdown -->
          <div class="relative">
            <select 
              v-model="selectedMessageType"
              @change="onMessageTypeChange"
              class="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all cursor-pointer shadow-sm"
            >
              <option v-for="type in availableMessageTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          <!-- "Output" Framed Box -->
          <div class="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
               <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Message</p>
            </div>
            <textarea 
              v-model="editableMessage"
              rows="6"
              class="w-full bg-white p-4 text-[13.5px] text-gray-700 leading-6 font-medium focus:outline-none transition-all resize-none block border-0"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="pt-2 space-y-3">
            <div class="flex items-center gap-2">
              <a 
                v-if="selectedMessageChannel !== 'email'"
                :href="getWhatsAppLink"
                target="_blank"
                :class="[!booking.guestPhone && !booking.guestMobile ? 'pointer-events-none opacity-50' : '', 'flex-1 border border-green-500 rounded-lg py-2 text-sm font-medium text-green-600 hover:bg-green-50 transition-all flex items-center justify-center gap-3 no-underline shadow-sm']"
              >
                Open in WhatsApp
                <WhatsAppIcon class="w-4 h-4 text-green-500" />
              </a>
              <button 
                v-if="selectedMessageChannel === 'email'"
                @click="sendEmail"
                :disabled="isSendingEmail || !booking.guestEmail"
                class="flex-1 border border-red-500 rounded-lg py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isSendingEmail" class="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></span>
                <EmailIcon v-else class="w-4 h-4 text-red-500" />
                {{ !booking.guestEmail ? 'No Email Provided' : 'Send email' }}
              </button>

              <button 
                v-if="selectedMessageChannel !== 'email' && booking.messagingStatus !== 'done'"
                @click="markAsSent('whatsapp')"
                :disabled="!booking.guestPhone && !booking.guestMobile"
                class="px-4 border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                Mark as sent
              </button>

              <button 
                v-if="booking.messagingStatus === 'done' || booking.messagingStatus === 'error'"
                @click="markAsTodo"
                title="Reset status to todo"
                class="px-4 border border-gray-200 rounded-lg py-2 text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Centered Modal Popover for Editing Arrival Time -->
    <Teleport to="body">
      <transition 
        enter-active-class="transition duration-200 ease-out" 
        enter-from-class="opacity-0 scale-95" 
        enter-to-class="opacity-100 scale-100" 
        leave-active-class="transition duration-150 ease-in" 
        leave-from-class="opacity-100 scale-100" 
        leave-to-class="opacity-0 scale-95"
      >
        <div 
          v-if="isEditingTime" 
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm" 
          @click.self="cancelEditingTime"
        >
          <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-[340px] max-w-[90vw]">
            <h3 class="text-base font-bold text-gray-800 mb-4">Edit Arrival Time</h3>
            <div class="space-y-4">
              <input 
                type="text" 
                v-model="editTimeValue" 
                ref="timeInputRefModal"
                class="w-full text-sm border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-shadow"
                placeholder="e.g. 14:00"
                @keyup.enter="saveArrivalTime"
                @keyup.escape="cancelEditingTime"
              />
              <div class="flex justify-end gap-3 mt-6">
                <button @click="cancelEditingTime" class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                <button @click="saveArrivalTime" :disabled="isSavingTime" class="px-5 py-2 text-sm font-bold bg-[#5b51ff] text-white rounded-lg hover:bg-[#4a42e0] transition-colors flex items-center justify-center min-w-[80px] disabled:opacity-50">
                  <span v-if="isSavingTime" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span v-else>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, h, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useHostelStore } from '../stores/hostel';
import { getDayOfWeek } from '../utils/helpers';
import { getRoomNumber } from '../services/messageService';
import { updateBookingMessagingStatus, updateBookingField } from '../services/arrivalsService';
import { updateBooking } from '../services/beds24Service';
import { sendGuestEmail } from '../services/emailService';
import { toast } from 'vue3-toastify';

const emit = defineEmits(['status-updated']);

const props = defineProps({
  booking: {
    type: Object,
    required: true
  },
  messages: {
    type: Array,
    default: () => []
  },
  hostelSettings: {
    type: Object,
    default: () => ({})
  },
  roomMappings: {
    type: Array,
    default: () => []
  },
  isLast: {
    type: Boolean,
    default: false
  },
  arrivalDate: {
    type: String,
    default: ''
  }
});

const hostelStore = useHostelStore();
const isExpanded = ref(false);
const selectedMessageType = ref(props.booking.messageType || 'defaultWelcomeMessage');
const editableMessage = ref('');
const isSendingEmail = ref(false);

const roomNumber = computed(() => {
  return getRoomNumber(props.booking.roomId, props.booking.unitId, props.roomMappings || []);
});

const availableMessageTypes = computed(() => {
  return props.messages.map(m => ({
    value: m.messageType,
    label: m.name,
    channel: m.channel || 'whatsapp'
  }));
});

const selectedMessageChannel = computed(() => {
  const current = availableMessageTypes.value.find(t => t.value === selectedMessageType.value);
  return current?.channel || 'whatsapp';
});

const avatarClasses = computed(() => {
  const id = hostelStore.currentHostel?.id;
  if (id === 'princesstreethostel') {
    return 'bg-blue-50 border-blue-200 text-gray-600';
  } else if (id === 'haystackhostel') {
    return 'bg-[#fff5e6] border-[#fcdba8] text-gray-600';
  }
  return 'bg-[#f8f9fa] border-gray-200 text-gray-600';
});

const generateMessage = () => {
  const template = props.messages.find(m => m.messageType === selectedMessageType.value);
  if (!template || !template.text) {
    editableMessage.value = 'Loading template...';
    return;
  }
  
  const dayName = getDayOfWeek(props.booking.arrival || props.booking.firstNight);
  const hostelName = hostelStore.currentHostel?.name || 'the hotel';
  const senderName = hostelStore.currentSender || props.hostelSettings?.senderName || 'Sophie';
  const whatsappNumber = props.hostelSettings?.whatsappNumber || '--whatsappNumber--';
  
  let text = template.text;
  text = text.replace(/--guestFirstName--/g, props.booking.guestFirstName || 'Guest');
  text = text.replace(/--senderName--/g, senderName);
  text = text.replace(/--hostelName--/g, hostelName);
  text = text.replace(/--dayOfWeek--/g, dayName);
  text = text.replace(/--checkinTime--/g, props.booking.calculatedCheckinTime || '--checkinTime--');
  text = text.replace(/--roomNumber--/g, roomNumber.value || '--roomNumber--');
  text = text.replace(/--doorCode--/g, props.hostelSettings?.doorCode || '--doorCode--');
  text = text.replace(/--wifiPassword--/g, props.hostelSettings?.wifiPassword || '--wifiPassword--');
  text = text.replace(/--whatsappNumber--/g, whatsappNumber);
  text = text.replace(/--officialCheckInTime--/g, props.hostelSettings?.officialCheckInTime || '--officialCheckInTime--');
  text = text.replace(/--receptionOpeningTime--/g, props.hostelSettings?.receptionOpeningTime || '--receptionOpeningTime--');

  editableMessage.value = text;
};

const onMessageTypeChange = () => {
  generateMessage();
};

watch(() => hostelStore.currentSender, () => {
  generateMessage();
});

watch(isExpanded, (val) => {
  if (val && !editableMessage.value) {
    generateMessage();
  }
});

/**
 * Editing for arrival time
 */
const timeInputRefModal = ref(null);
const isEditingTime = ref(false);
const editTimeValue = ref('');
const isSavingTime = ref(false);

const startEditingTime = async () => {
  editTimeValue.value = props.booking.guestArrivalTime || '';
  isEditingTime.value = true;
  
  await nextTick();
  if (timeInputRefModal.value) {
    timeInputRefModal.value.focus();
  }
};

const cancelEditingTime = () => {
  isEditingTime.value = false;
};

const saveArrivalTime = async () => {
  if (isSavingTime.value) return;
  
  const newValue = editTimeValue.value.trim();
  const currentValue = (props.booking.guestArrivalTime || '').trim();
  
  // if no change, just close
  if (newValue === currentValue) {
    cancelEditingTime();
    return;
  }

  isSavingTime.value = true;
  try {
    const hostelId = hostelStore.currentHostel?.id;
    if (!hostelId || !props.arrivalDate) throw new Error('Missing hostel info');

    // Update Beds24
    const { beds24ApiKey, propKey } = props.hostelSettings;
    if (beds24ApiKey && propKey) {
      await updateBooking(beds24ApiKey, propKey, props.booking.bookId, {
        guestArrivalTime: newValue
      });

      // Update Firestore
      await updateBookingField(
        hostelId,
        props.arrivalDate,
        props.booking.bookId,
        'guestArrivalTime',
        newValue
      );
    } else {
      console.warn('Missing Beds24 API credentials');
      throw new Error('Missing Beds24 API credentials');
    }
    
    emit('status-updated', {
      bookId: props.booking.bookId,
      messagingStatus: props.booking.messagingStatus,
      messagingChannel: props.booking.messagingChannel,
      guestArrivalTime: newValue
    });
    
    toast.success('Arrival time updated', { autoClose: 1500 });
    cancelEditingTime();
  } catch (err) {
    console.error('Error saving arrival time:', err);
    toast.error('Failed to update arrival time');
  } finally {
    isSavingTime.value = false;
  }
};

onMounted(() => {
  generateMessage();
});

const copyPhone = async () => {
  const phone = props.booking.guestPhone || props.booking.guestMobile || '';
  if (!phone) return;
  try {
    await navigator.clipboard.writeText(phone);
    toast.success('Phone number copied', { autoClose: 1500 });
  } catch {
    toast.error('Failed to copy');
  }
};

const getWhatsAppLink = computed(() => {
  const phone = props.booking.guestPhone || props.booking.guestMobile || '';
  const cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');
  const encodedText = encodeURIComponent(editableMessage.value);
  
  // Using web.whatsapp.com for desktop and api.whatsapp.com/send for dynamic redirect
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
});

const getStatusClass = (status) => {
  if (status === 'done') {
    return 'bg-[#ecf5ed] text-[#4a7c59] border-transparent shadow-none';
  } else if (status === 'error') {
    return 'bg-[#fdf0f0] text-[#c94b4b] border-transparent shadow-none';
  } else {
    return 'bg-[#fef9f1] text-[#9a6a38] border-transparent shadow-none';
  }
};

const getStatusLabel = (status, channel) => {
  if (status === 'done') {
    if (channel === 'whatsapp') return 'WhatsApp';
    if (channel === 'email') return 'Email';
    return 'Sent';
  }
  if (status === 'error') return 'Error';
  return 'Todo';
};

/**
 * Manual "Mark as sent" for WhatsApp messages.
 */
const markAsSent = async (channel) => {
  try {
    const hostelId = hostelStore.currentHostel?.id;
    if (!hostelId || !props.arrivalDate) return;

    // 1. Update messaging status in Firestore
    await updateBookingMessagingStatus(
      hostelId,
      props.arrivalDate,
      props.booking.bookId,
      'done',
      channel
    );

    // 2. Update guestArrivalTime in Beds24: prepend 'whatsapp message sent - '
    const currentArrivalTime = props.booking.guestArrivalTime || '';
    const newArrivalTime = currentArrivalTime
      ? `whatsapp message sent - ${currentArrivalTime}`
      : 'whatsapp message sent';

    try {
      const { beds24ApiKey, propKey } = props.hostelSettings;
      if (beds24ApiKey && propKey) {
        await updateBooking(beds24ApiKey, propKey, props.booking.bookId, {
          guestArrivalTime: newArrivalTime
        });

        // 3. Update guestArrivalTime in Firestore too
        await updateBookingField(
          hostelId,
          props.arrivalDate,
          props.booking.bookId,
          'guestArrivalTime',
          newArrivalTime
        );
      } else {
        console.warn('Missing Beds24 API credentials, skipping Beds24 update');
      }
    } catch (beds24Err) {
      // Don't fail the whole operation — messaging status is already saved
      console.error('Error updating Beds24 guestArrivalTime:', beds24Err);
    }

    emit('status-updated', {
      bookId: props.booking.bookId,
      messagingStatus: 'done',
      messagingChannel: channel,
      guestArrivalTime: newArrivalTime
    });

    toast.success('Marked as sent', { autoClose: 1500 });
  } catch (err) {
    console.error('Error marking as sent:', err);
    toast.error('Failed to update status');
  }
};

/**
 * Reset status back to "todo".
 */
const markAsTodo = async () => {
  try {
    const hostelId = hostelStore.currentHostel?.id;
    if (!hostelId || !props.arrivalDate) return;

    await updateBookingMessagingStatus(
      hostelId,
      props.arrivalDate,
      props.booking.bookId,
      'todo',
      null
    );

    emit('status-updated', {
      bookId: props.booking.bookId,
      messagingStatus: 'todo',
      messagingChannel: null
    });

    toast.success('Status reset to todo', { autoClose: 1500 });
  } catch (err) {
    console.error('Error resetting status:', err);
    toast.error('Failed to reset status');
  }
};

/**
 * Send email and auto-mark as done on success, error on failure.
 */
const sendEmail = async () => {
  if (!props.booking.guestEmail) {
    toast.error('No guest email address available');
    return;
  }

  isSendingEmail.value = true;
  try {
    const hostelId = hostelStore.currentHostel?.id;
    const hostelName = hostelStore.currentHostel?.name || 'the hotel';
    if (!hostelId || !props.arrivalDate) return;

    // Send email via Cloud Function
    const website = hostelId === 'princesstreethostel' ? 'princesstreethostel.com' : 'haystackhostel.com';
    const phone = props.hostelSettings?.whatsappNumber || props.hostelSettings?.phone || '';
    
    await sendGuestEmail(
      hostelId,
      hostelName,
      props.booking.guestEmail,
      editableMessage.value,
      phone,
      website
    );

    // 1. Update messaging status in Firestore
    await updateBookingMessagingStatus(
      hostelId,
      props.arrivalDate,
      props.booking.bookId,
      'done',
      'email'
    );

    // 2. Update guestArrivalTime in Beds24: prefix 'email message sent - '
    const currentArrivalTime = props.booking.guestArrivalTime || '';
    const newArrivalTime = currentArrivalTime
      ? `email message sent - ${currentArrivalTime}`
      : 'email message sent';

    try {
      const { beds24ApiKey, propKey } = props.hostelSettings;
      if (beds24ApiKey && propKey) {
        await updateBooking(beds24ApiKey, propKey, props.booking.bookId, {
          guestArrivalTime: newArrivalTime
        });

        // 3. Update guestArrivalTime in Firestore
        await updateBookingField(
          hostelId,
          props.arrivalDate,
          props.booking.bookId,
          'guestArrivalTime',
          newArrivalTime
        );
      } else {
        console.warn('Missing Beds24 API credentials, skipping Beds24 update');
      }
    } catch (beds24Err) {
      console.error('Error updating Beds24 guestArrivalTime:', beds24Err);
    }

    emit('status-updated', {
      bookId: props.booking.bookId,
      messagingStatus: 'done',
      messagingChannel: 'email',
      guestArrivalTime: newArrivalTime
    });

    toast.success('Email sent successfully', { autoClose: 2000 });
  } catch (err) {
    console.error('Error sending email:', err);

    // Mark as error in Firestore
    try {
      const hostelId = hostelStore.currentHostel?.id;
      if (hostelId && props.arrivalDate) {
        await updateBookingMessagingStatus(
          hostelId,
          props.arrivalDate,
          props.booking.bookId,
          'error',
          'email'
        );

        emit('status-updated', {
          bookId: props.booking.bookId,
          messagingStatus: 'error',
          messagingChannel: 'email'
        });
      }
    } catch (statusErr) {
      console.error('Error updating error status:', statusErr);
    }

    toast.error('Failed to send email');
  } finally {
    isSendingEmail.value = false;
  }
};

// Define icons as components with render functions for runtime build
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

const RefreshIcon = {
  render() {
    return h('svg', { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, [
      h('path', { d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" })
    ]);
  }
};

</script>
