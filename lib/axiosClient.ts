import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

export const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach access token automatically
axiosClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})


// 🔁 Handle 401 + refresh token
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (!originalRequest) return Promise.reject(error)

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        if (typeof window === 'undefined') throw new Error('No refresh token on server')

        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token found')

        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken }, { withCredentials: true })
        const newToken = res.data.accessToken
        localStorage.setItem('authToken', newToken)

        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return axiosClient(originalRequest)
      } catch (err) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
        window.location.replace('/login')
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)

