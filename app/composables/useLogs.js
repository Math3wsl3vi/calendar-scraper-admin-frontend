export const useLogs = () => {
  const { apiCall } = useApi()
  const { addNotification } = useNotifications()

  const clearLogs = async () => {
    await apiCall('/logs', { method: 'DELETE' })
    addNotification('Logs cleared successfully', 'success')
  }

  return { clearLogs }
}
