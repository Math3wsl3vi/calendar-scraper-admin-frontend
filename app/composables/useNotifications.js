import { ref } from 'vue'

const notifications = ref([])

export const useNotifications = () => {
  const addNotification = (message, type = 'info') => {
    notifications.value.push({ message, type, id: Date.now() })
    setTimeout(() => {
      notifications.value = notifications.value.filter(n => n.id !== Date.now())
    }, 3000)
  }

  return { notifications, addNotification }
}
