import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const refreshToken = ref(localStorage.getItem('refreshToken') || null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Initialize user from token on store creation
  const initAuth = async () => {
    if (token.value) {
      try {
        await fetchUser()
      } catch (error) {
        console.error('Failed to fetch user:', error)
        logout()
      }
    }
  }

  const fetchUser = async () => {
    if (!token.value) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        user.value = data.user
      } else {
        throw new Error('Failed to fetch user')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  }

  const setTokens = (newToken, newRefreshToken) => {
    token.value = newToken
    refreshToken.value = newRefreshToken

    localStorage.setItem('token', newToken)
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken)
    }
  }

  const register = async (email, password, firstName, lastName, businessName = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          businessName
        })
      })

      const data = await response.json()

      if (response.ok) {
        setTokens(data.token, data.refreshToken)
        user.value = data.user
        return { success: true, user: data.user }
      } else {
        return { success: false, message: data.message || 'Registration failed' }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, message: 'Network error during registration' }
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await response.json()

      if (response.ok) {
        setTokens(data.token, data.refreshToken)
        user.value = data.user
        return { success: true, user: data.user }
      } else {
        return { success: false, message: data.message || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Network error during login' }
    }
  }

  const loginWithGoogle = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_BASE_URL}/api/auth/google`
  }

  const handleOAuthCallback = async (callbackToken, callbackRefreshToken) => {
    setTokens(callbackToken, callbackRefreshToken)
    await fetchUser()
  }

  const logout = () => {
    user.value = null
    token.value = null
    refreshToken.value = null

    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  }

  const getAuthHeaders = () => {
    if (token.value) {
      return {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      }
    }
    return {
      'Content-Type': 'application/json'
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    initAuth,
    loginWithGoogle,
    handleOAuthCallback,
    logout,
    getAuthHeaders
  }
})
