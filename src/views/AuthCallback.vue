<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <div class="loading-spinner mx-auto mb-4"></div>
      <h2 class="text-xl font-semibold text-gray-900">Completing sign-in...</h2>
      <p class="text-gray-600 mt-2">Please wait while we log you in</p>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'AuthCallback',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    onMounted(async () => {
      try {
        // Get tokens from URL query params
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        const refreshToken = urlParams.get('refreshToken')

        if (token && refreshToken) {
          // Save tokens and fetch user
          await authStore.handleOAuthCallback(token, refreshToken)

          // Redirect to home page
          router.push('/')
        } else {
          // No tokens found, redirect to home with error
          console.error('No tokens found in callback URL')
          router.push('/?error=auth_failed')
        }
      } catch (error) {
        console.error('OAuth callback error:', error)
        router.push('/?error=auth_failed')
      }
    })

    return {}
  }
}
</script>

<style scoped>
.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2563EB;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
