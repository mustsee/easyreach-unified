import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth, googleProvider, db } from '../firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, getDocs } from 'firebase/firestore'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthorized = ref(false)
  const isAuthReady = ref(false)

  // Check if an email is in the 'users' collection
  const checkIsAuthorized = async (email) => {
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('email', '==', email))
      const querySnapshot = await getDocs(q)
      return !querySnapshot.empty
    } catch (error) {
      console.error("Error checking authorization:", error)
      return false
    }
  }

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const loggedInUser = result.user

      const authorized = await checkIsAuthorized(loggedInUser.email)

      if (authorized) {
        user.value = loggedInUser
        isAuthorized.value = true
        router.push('/arrivals')
      } else {
        // Disconnect automatically without showing errors
        await signOut(auth)
        user.value = null
        isAuthorized.value = false
      }
    } catch (error) {
      console.error("Error during login:", error)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      user.value = null
      isAuthorized.value = false
      router.push('/')
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  let resolveAuthReady
  const authReadyPromise = new Promise(resolve => { resolveAuthReady = resolve })

  // Setup auth state observer
  onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      const authorized = await checkIsAuthorized(currentUser.email)
      if (authorized) {
        user.value = currentUser
        isAuthorized.value = true
      } else {
        await signOut(auth)
        user.value = null
        isAuthorized.value = false
      }
    } else {
      user.value = null
      isAuthorized.value = false
    }
    isAuthReady.value = true
    resolveAuthReady()
  })

  return {
    user,
    isAuthorized,
    isAuthReady,
    authReadyPromise,
    loginWithGoogle,
    logout
  }
})
