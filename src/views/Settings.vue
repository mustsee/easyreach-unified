<template>
  <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
      <div 
        class="px-3 py-1 rounded-full text-xs font-semibold"
        :style="{ backgroundColor: hostelStore.currentHostel?.color + '20', color: hostelStore.currentHostel?.color }"
      >
        {{ hostelStore.currentHostel?.name }}
      </div>
    </div>

    <!-- Sender Names -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="p-6 border-b border-gray-100 bg-gray-50">
        <h2 class="text-xl font-bold text-gray-800">Sender Names</h2>
        <p class="text-sm text-gray-500 mt-1">Manage the names for guest communications.</p>
      </div>
      
      <div class="p-6">
        <form @submit.prevent="addSender" class="flex flex-col sm:flex-row gap-3 mb-8">
          <div class="flex-1 relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <input 
              v-model="newSenderName" 
              type="text" 
              placeholder="Full name"
              class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b51ff] focus:border-[#5b51ff] transition-all duration-200"
              required
            >
          </div>
          <button 
            type="submit" 
            :disabled="isSubmittingSender"
            class="px-5 py-2 bg-[#5b51ff] hover:bg-[#4a42e0] text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[120px]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Add Sender</span>
          </button>
        </form>

        <div v-if="isLoadingSenders" class="flex justify-center py-8">
          <svg class="animate-spin h-6 w-6 text-indigo-500" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
        <div v-else-if="senders.length === 0" class="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p class="text-sm text-gray-500">No senders added yet.</p>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="sender in senders" :key="sender.id" class="px-4 py-3 bg-gray-50 rounded-xl flex items-center justify-between group hover:bg-gray-100 transition-colors border border-gray-100">
            <span class="text-sm font-medium text-gray-900">{{ sender.name }}</span>
            <button @click="removeSender(sender.id)" class="text-gray-400 hover:text-red-500 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Hostel Settings (Door Code & Wifi) -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="p-6 border-b border-gray-100 bg-gray-50">
        <h2 class="text-xl font-bold text-gray-800">Hostel Details</h2>
        <p class="text-sm text-gray-500 mt-1">Configure door codes and wifi for your guests.</p>
      </div>
      
      <div class="p-6">
        <form @submit.prevent="saveSettings" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label for="doorCode" class="text-sm font-medium text-gray-700">Door Code</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
              </div>
              <input 
                v-model="hostelSettings.doorCode" 
                type="text" 
                id="doorCode" 
                placeholder="e.g. 1234"
                class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b51ff] focus:border-[#5b51ff] transition-all duration-200"
              >
            </div>
          </div>
          
          <div class="space-y-2">
            <label for="wifiPassword" class="text-sm font-medium text-gray-700">Wifi Password</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.373 7.636c5.975-5.975 15.655-5.975 21.63 0"></path></svg>
              </div>
              <input 
                v-model="hostelSettings.wifiPassword" 
                type="text" 
                id="wifiPassword" 
                placeholder="Wifi password"
                class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b51ff] focus:border-[#5b51ff] transition-all duration-200"
              >
            </div>
          </div>

          <div class="space-y-2">
            <label for="officialCheckInTime" class="text-sm font-medium text-gray-700">Official Check-in Time</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <input 
                v-model="hostelSettings.officialCheckInTime" 
                type="text" 
                id="officialCheckInTime" 
                placeholder="e.g. 3pm"
                class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b51ff] focus:border-[#5b51ff] transition-all duration-200"
              >
            </div>
          </div>

          <div class="space-y-2">
            <label for="receptionOpeningTime" class="text-sm font-medium text-gray-700">Reception Opens at</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <input 
                v-model="hostelSettings.receptionOpeningTime" 
                type="text" 
                id="receptionOpeningTime" 
                placeholder="e.g. 8.00am"
                class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b51ff] focus:border-[#5b51ff] transition-all duration-200"
              >
            </div>
          </div>

          <div class="space-y-2">
            <label for="whatsappNumber" class="text-sm font-medium text-gray-700">WhatsApp Number</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              </div>
              <input 
                v-model="hostelSettings.whatsappNumber" 
                type="text" 
                id="whatsappNumber" 
                placeholder="e.g. +44..."
                class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b51ff] focus:border-[#5b51ff] transition-all duration-200"
              >
            </div>
          </div>

          <div class="sm:col-span-2 border-t border-gray-100 pt-6">
            <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg class="w-4 h-4 text-[#5b51ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
              Beds24 Integration
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label for="beds24ApiKey" class="text-sm font-medium text-gray-700">Account API Key</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                  </div>
                  <input 
                    v-model="hostelSettings.beds24ApiKey" 
                    type="password" 
                    id="beds24ApiKey" 
                    placeholder="Beds24 API Key"
                    class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b51ff] focus:border-[#5b51ff] transition-all duration-200"
                  >
                </div>
              </div>
              
              <div class="space-y-2">
                <label for="propKey" class="text-sm font-medium text-gray-700">PropKey (Property ID)</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  </div>
                  <input 
                    v-model="hostelSettings.propKey" 
                    type="text" 
                    id="propKey" 
                    placeholder="Beds24 PropKey"
                    class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b51ff] focus:border-[#5b51ff] transition-all duration-200"
                  >
                </div>
              </div>
            </div>

            <!-- Auto-handle Hostelworld bookings Toggle -->
            <div class="mt-8 pt-6 border-t border-gray-100">
              <label class="flex items-center gap-3 cursor-pointer group">
                <div class="relative flex-shrink-0">
                  <input type="checkbox" v-model="hostelSettings.autoHandleHostelworld" class="sr-only">
                  <div class="block w-11 h-6 rounded-full transition-colors duration-200 ease-in-out" :class="hostelSettings.autoHandleHostelworld ? 'bg-[#5b51ff]' : 'bg-gray-200'"></div>
                  <div class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out shadow-sm" :class="{'translate-x-5': hostelSettings.autoHandleHostelworld}"></div>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Auto-handle Hostelworld arrivals</span>
                  <p class="text-[13px] text-gray-500 mt-0.5 max-w-lg leading-relaxed">Automatically marks Hostelworld bookings as "Done" and updates Beds24 when loading the guests list, since they receive automated emails.</p>
                </div>
              </label>
            </div>
          </div>
          
          <div class="sm:col-span-2 flex justify-end mt-4">
            <button 
              type="submit" 
              :disabled="isSavingSettings"
              class="px-6 py-2 bg-[#5b51ff] hover:bg-[#4a42e0] text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              <svg v-if="isSavingSettings" class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Room Data Sync -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-6">
          <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <svg class="w-6 h-6 text-[#5b51ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500">Sync your room names and unit configurations from Beds24.</p>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              Last Synced: <span class="text-gray-600">{{ lastSyncDisplay }}</span>
            </p>
          </div>
        </div>
        
        <button 
          @click="syncRoomsFromBeds24" 
          :disabled="isSyncingRooms"
          class="w-full md:w-auto px-6 py-2 bg-[#5b51ff] hover:bg-[#4a42e0] text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          <svg 
            class="w-4 h-4" 
            :class="{ 'animate-spin': isSyncingRooms }"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          {{ isSyncingRooms ? 'Syncing...' : 'Sync from Beds24' }}
        </button>
      </div>
    </div>

    <!-- Message Templates -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Message Templates</h2>
          <p class="text-sm text-gray-500 mt-1">Configure the automated messages sent to guests.</p>
        </div>
        <button 
          @click="showAddTemplate = !showAddTemplate"
          class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
          :class="showAddTemplate ? 'text-gray-600 bg-gray-100' : 'text-white bg-[#5b51ff] hover:bg-[#4a42e0]'"
        >
          {{ showAddTemplate ? 'Cancel' : 'New Template' }}
        </button>
      </div>
      
      <div class="p-6">
        <!-- New/Edit Template Form -->
        <div v-if="showAddTemplate || editingTemplate" class="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-1">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Template Name</label>
              <input 
                v-model="templateForm.name" 
                type="text" 
                placeholder="e.g. Late Arrival Info"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b51ff]"
              >
            </div>
            <div class="space-y-1">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Channel</label>
              <div class="relative">
                <select 
                  v-model="templateForm.channel" 
                  class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b51ff] bg-white appearance-none"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                </select>
                <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Variables</label>
              <div class="relative">
                <select 
                  @change="addVariableToText" 
                  class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b51ff] bg-white appearance-none"
                >
                  <option value="">Insert variable...</option>
                  <option v-for="v in AVAILABLE_VARIABLES" :key="v" :value="v">{{ v }}</option>
                </select>
                <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex flex-wrap gap-2 mt-2">
            <span 
              v-for="v in templateForm.variables" 
              :key="v" 
              class="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-md text-[11px] font-medium text-gray-600 shadow-sm"
            >
              {{ v }}
              <button @click="removeVariable(v)" class="text-gray-400 hover:text-red-500">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </span>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Message Text</label>
            <textarea 
              v-model="templateForm.text" 
              rows="6"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5b51ff] font-mono leading-relaxed"
              placeholder="Hi --guestFirstName--..."
            ></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button 
              @click="cancelEdit" 
              class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="saveTemplate" 
              :disabled="isSavingTemplate || !templateForm.name || !templateForm.text"
              class="px-6 py-2 bg-[#5b51ff] hover:bg-[#4a42e0] text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              <svg v-if="isSavingTemplate" class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>{{ editingTemplate ? 'Update Template' : 'Add Template' }}</span>
            </button>
          </div>
        </div>

        <div v-if="isLoadingMessages" class="flex justify-center py-12">
          <svg class="animate-spin h-8 w-8 text-indigo-500" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
        
        <div v-else class="space-y-4">
          <div 
            v-for="msg in messages" 
            :key="msg.messageType" 
            class="border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 transition-colors group"
          >
            <div class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3">
                  <h3 class="font-bold text-gray-900 truncate">{{ msg.name }}</h3>
                  <span v-if="msg.isDefault" class="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded uppercase tracking-wider">Default</span>
                  <span class="px-2 py-0.5 border border-indigo-100 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase tracking-wider">{{ msg.channel || 'whatsapp' }}</span>
                </div>
                <div class="flex flex-wrap gap-1.5 mt-2">
                  <span v-for="v in msg.variables" :key="v" class="text-[10px] font-semibold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100/50 uppercase tracking-tighter">{{ v }}</span>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <button 
                  @click="editExistingTemplate(msg)"
                  class="p-2 text-gray-400 hover:text-[#5b51ff] hover:bg-indigo-50 rounded-lg transition-all"
                  title="Edit template"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </button>
                <button 
                  v-if="!msg.isDefault"
                  @click="deleteTemplate(msg.id)" 
                  class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete template"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
            
            <div class="px-5 pb-5">
              <div class="bg-gray-50/50 rounded-xl p-4 border border-gray-100 text-sm text-gray-600 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed custom-scrollbar">
                {{ msg.text }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { toast } from 'vue3-toastify';
import { useHostelStore } from '../stores/hostel';
import { getDocuments, createDocument, deleteDocument } from '../services/firestoreService';
import { 
  loadMessages, 
  saveMessage, 
  deleteMessage, 
  loadHostelSettings, 
  saveHostelSettings,
  loadRoomMappings,
  saveRoomMapping,
  AVAILABLE_VARIABLES 
} from '../services/messageService';
import { fetchRooms } from '../services/beds24Service';
import { where } from 'firebase/firestore';

const hostelStore = useHostelStore();

// Senders State (Synced with hostelStore)
const senders = computed(() => hostelStore.senders);
const isLoadingSenders = ref(true);
const isSubmittingSender = ref(false);
const newSenderName = ref('');

// Hostel Settings State
const hostelSettings = ref({
  doorCode: '',
  wifiPassword: '',
  beds24ApiKey: '',
  propKey: '',
  autoHandleHostelworld: true
});
const isSavingSettings = ref(false);

// Room Mappings State
const roomMappings = ref([]);
const isLoadingMappings = ref(false);
const isSyncingRooms = ref(false);

// Messages State
const messages = ref([]);
const isLoadingMessages = ref(true);
const isSavingTemplate = ref(false);
const showAddTemplate = ref(false);
const editingTemplate = ref(null);

const templateForm = ref({
  name: '',
  variables: [],
  text: '',
  messageType: '',
  channel: 'whatsapp'
});

const lastSyncDisplay = computed(() => {
  if (roomMappings.value.length === 0) return 'Never';
  const latest = roomMappings.value.reduce((prev, current) => {
    return (prev.updatedAt > current.updatedAt) ? prev : current;
  }, roomMappings.value[0]);
  
  if (!latest.updatedAt) return 'Pending sync...';
  
  return new Date(latest.updatedAt).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
});

// Load Data
const fetchData = async () => {
  if (!hostelStore.currentHostel?.id) return;
  
  isLoadingSenders.value = true;
  isLoadingMessages.value = true;
  
  try {
    // Parallel loading
    const [_, fetchedSettings, fetchedMessages, fetchedMappings] = await Promise.all([
      hostelStore.loadSenders(),
      loadHostelSettings(hostelStore.currentHostel.id),
      loadMessages(hostelStore.currentHostel.id),
      loadRoomMappings(hostelStore.currentHostel.id)
    ]);
    
    hostelSettings.value = fetchedSettings;
    messages.value = fetchedMessages;
    roomMappings.value = fetchedMappings;
  } catch (error) {
    console.error('Failed to load data:', error);
  } finally {
    isLoadingSenders.value = false;
    isLoadingMessages.value = false;
  }
};

// Senders Actions
const addSender = async () => {
  if (!newSenderName.value || !hostelStore.currentHostel?.id) return;
  isSubmittingSender.value = true;
  try {
    const senderData = {
      name: newSenderName.value,
      hostelId: hostelStore.currentHostel.id,
      createdAt: new Date().toISOString()
    };
    const newSender = await createDocument('senders', senderData);
    await hostelStore.loadSenders();
    newSenderName.value = '';
    toast.success('Sender added successfully!');
  } catch (error) {
    console.error('Failed to add sender:', error);
    toast.error('Failed to add sender.');
  } finally {
    isSubmittingSender.value = false;
  }
};

const removeSender = async (id) => {
  if (!confirm('Are you sure you want to remove this sender?')) return;
  try {
    await deleteDocument('senders', id);
    await hostelStore.loadSenders();
    toast.success('Sender removed successfully!');
  } catch (error) {
    console.error('Failed to remove sender:', error);
    toast.error('Failed to remove sender.');
  }
};

// Hostel Settings Actions
const saveSettings = async () => {
  if (!hostelStore.currentHostel?.id) return;
  isSavingSettings.value = true;
  try {
    await saveHostelSettings(hostelStore.currentHostel.id, { ...hostelSettings.value });
    toast.success('Settings saved successfully!');
  } catch (error) {
    console.error('Failed to save settings:', error);
    toast.error('Failed to save settings.');
  } finally {
    isSavingSettings.value = false;
  }
};

// Message Templates Actions
const addVariableToText = (event) => {
  const variable = event.target.value;
  if (!variable) return;
  
  if (!templateForm.value.variables.includes(variable)) {
    templateForm.value.variables.push(variable);
  }
  
  // Insert into textarea at cursor or end
  const placeholder = `--${variable}--`;
  templateForm.value.text += placeholder;
  
  // Reset select
  event.target.value = '';
};

const removeVariable = (variable) => {
  templateForm.value.variables = templateForm.value.variables.filter(v => v !== variable);
};

const editExistingTemplate = (msg) => {
  editingTemplate.value = msg;
  templateForm.value = {
    name: msg.name,
    variables: [...msg.variables],
    text: msg.text,
    messageType: msg.messageType,
    channel: msg.channel || 'whatsapp'
  };
  showAddTemplate.value = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEdit = () => {
  editingTemplate.value = null;
  showAddTemplate.value = false;
  templateForm.value = { name: '', variables: [], text: '', messageType: '', channel: 'whatsapp' };
};

const saveTemplate = async () => {
  if (!hostelStore.currentHostel?.id) return;
  isSavingTemplate.value = true;
  
  try {
    const data = { ...templateForm.value };
    
    // If it's a new message, generate a type
    if (!data.messageType) {
      data.messageType = 'custom_' + Date.now().toString(36);
    }
    
    // If editing a default message, handle correctly
    if (editingTemplate.value?.id) {
      data.id = editingTemplate.value.id;
    }

    const saved = await saveMessage(hostelStore.currentHostel.id, data);
    
    // Update local list
    const index = messages.value.findIndex(m => m.messageType === saved.messageType);
    if (index !== -1) {
      messages.value[index] = saved;
    } else {
      messages.value.push(saved);
    }
    
    toast.success(editingTemplate.value ? 'Template updated successfully!' : 'Template added successfully!');
    cancelEdit();
  } catch (error) {
    console.error('Failed to save template:', error);
    toast.error('Failed to save template.');
  } finally {
    isSavingTemplate.value = false;
  }
};

const deleteTemplate = async (id) => {
  if (!confirm('Are you sure you want to delete this custom template?')) return;
  try {
    await deleteMessage(id);
    messages.value = messages.value.filter(m => m.id !== id);
    toast.success('Template deleted successfully!');
  } catch (error) {
    console.error('Failed to delete message:', error);
    toast.error('Failed to delete template.');
  }
};

// Room Mapping Actions
const syncRoomsFromBeds24 = async () => {
  if (!hostelSettings.value.beds24ApiKey || !hostelSettings.value.propKey) {
    toast.error('Please save your Beds24 API Key and PropKey first.');
    return;
  }
  
  if (!confirm('This will purge all existing room data for this hostel and re-fetch fresh information from Beds24. Continue?')) {
    return;
  }
  
  isSyncingRooms.value = true;
  try {
    // 1. Purge existing mappings for this hostel
    const deletePromises = roomMappings.value.map(m => deleteDocument('roomMappings', m.id));
    await Promise.all(deletePromises);
    roomMappings.value = [];

    // 2. Fetch from Beds24
    const beds24Rooms = await fetchRooms(
      hostelSettings.value.beds24ApiKey, 
      hostelSettings.value.propKey,
      hostelStore.currentHostel.beds24PropId
    );
    
    // 3. Process each room from Beds24
    for (const room of beds24Rooms) {
      // Auto-detect private status
      const isPrivate = /private/i.test(room.name || '');

      // Parse unit names from Beds24 if available
      const unitMappings = { '1': '' };
      let isUnique = room.qty === "1"; // Default for single units

      if (room.unitNames) {
        const names = room.unitNames.split(/\r\n|\n|\r/).map(n => n.trim()).filter(n => n);
        names.forEach((name, index) => {
          unitMappings[String(index + 1)] = name;
        });

        // Uniqueness Detection: 
        if (names.length > 1) {
          const prefixes = names.map(n => n.split(' - ')[0].trim());
          const allSamePrefix = prefixes.every(p => p === prefixes[0]);
          isUnique = allSamePrefix;
        }
      }

      const newMapping = {
        roomId: String(room.roomId),
        roomName: room.name || 'Unknown Room',
        isPrivate,
        isUnique,
        beds: room.maxPeople || 1,
        qty: room.qty || 1,
        unitMappings
      };
      
      const saved = await saveRoomMapping(hostelStore.currentHostel.id, newMapping);
      roomMappings.value.push(saved);
    }
    toast.success('Rooms synced and updated successfully!');
  } catch (error) {
    console.error('Failed to sync rooms:', error);
    toast.error('Failed to sync rooms. Check your API keys.');
  } finally {
    isSyncingRooms.value = false;
  }
};

// Functions updateMappingField and updateUnitMapping are no longer needed as the UI is gone.

// Lifecycle
watch(() => hostelStore.currentHostel, () => {
  fetchData();
}, { deep: true });

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
