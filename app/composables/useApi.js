export const useApi = () => {
  const baseUrl = 'http://localhost:5000/api' // Change to your backend URL

  const apiCall = async (endpoint, options = {}) => {
    try {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `API Error: ${res.status}`)
      }

      return await res.json()
    } catch (error) {
      console.error(`❌ API Error: ${error.message}`)
      throw error
    }
  }

  return { apiCall }
}
