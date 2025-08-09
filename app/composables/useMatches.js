import { ref, readonly } from 'vue'

export const useMatches = () => {
  const { apiCall } = useApi()
  const { addNotification } = useNotifications()

  const matches = ref([])

  const fetchMatches = async () => {
    const data = await apiCall('/matches')
    matches.value = data.matches || []
  }

  const clearMatches = async () => {
    await apiCall('/matches', { method: 'DELETE' })
    matches.value = []
    addNotification('All matches cleared', 'success')
  }

  return {
    matches: readonly(matches),
    fetchMatches,
    clearMatches
  }
}
