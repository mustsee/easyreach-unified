import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { getDocuments } from '../services/firestoreService'
import { where } from 'firebase/firestore'

export const useHostelStore = defineStore('hostel', () => {
  const hostels = ref([
    { id: 'princesstreethostel', name: 'Princes Street Hostel', color: '#2C7A90', shortName: 'Princes St.', beds24PropId: '150425' },
    { id: 'haystackhostel', name: 'Haystack Hostel', color: '#CC7314', shortName: 'Haystack', beds24PropId: '131407' }
  ])

  // Use localStorage to remember the selected hostel
  const savedHostelId = localStorage.getItem('selectedHostelId')
  const initialHostel = hostels.value.find(h => h.id === savedHostelId) || hostels.value[0]

  const currentHostel = ref(initialHostel)
  const currentSender = ref('')
  const senders = ref([])

  async function loadSenders() {
    if (!currentHostel.value?.id) {
      senders.value = []
      currentSender.value = ''
      return
    }
    try {
      const fetchedSenders = await getDocuments('senders', [
        where('hostelId', '==', currentHostel.value.id)
      ])
      senders.value = fetchedSenders
      if (fetchedSenders.length > 0) {
        if (!fetchedSenders.some(s => s.name === currentSender.value)) {
          currentSender.value = fetchedSenders[0].name
        }
      } else {
        currentSender.value = ''
      }
    } catch (error) {
      console.error('Error loading senders:', error)
    }
  }

  function setHostel(hostelId) {
    const found = hostels.value.find(h => h.id === hostelId)
    if (found) {
      currentHostel.value = found
      localStorage.setItem('selectedHostelId', hostelId)
      // loadSenders will be triggered by the watch
    }
  }

  // Initial load and watch for changes
  watch(() => currentHostel.value?.id, () => {
    loadSenders()
  }, { immediate: true })

  return { hostels, currentHostel, setHostel, currentSender, senders, loadSenders }
})
