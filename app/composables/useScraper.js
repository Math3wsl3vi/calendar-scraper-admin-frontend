import { ref, readonly } from 'vue' // ✅ added readonly import

export const useScraper = () => {
  const { apiCall } = useApi()
  const { addNotification } = useNotifications()
  
  const scraperStatus = ref({
    isRunning: false,
    isScheduled: false,
    lastRun: null,
    currentVenue: null
  })
  
  const settings = ref({
    season: '2024/2025',
    linkStructure: 'https://www.bordtennisportalen.dk/DBTU/HoldTurnering/Stilling/#4.{season}.{pool}.{group}.{region}...',
    venue: '',
    autorun: true
  })
  
  const startScraping = async (options = {}) => {
    try {
      await apiCall('/scraper/start', {
        method: 'POST',
        body: {
          venue: options.venue || settings.value.venue,
          season: options.season || settings.value.season,
          executionType: 'manual'
        }
      })
      
      addNotification('Scraper started successfully', 'success')
      await getStatus()
    } catch (error) {
      addNotification(`Failed to start scraper: ${error.message}`, 'error')
      throw error
    }
  }
  
  const getStatus = async () => {
    try {
      const response = await apiCall('/scraper/status')
      scraperStatus.value = response.status
    } catch (error) {
      console.error('Failed to get scraper status:', error)
    }
  }
  
  const updateSettings = async (newSettings) => {
    try {
      await apiCall('/scraper/settings', {
        method: 'PUT',
        body: newSettings
      })
      
      Object.assign(settings.value, newSettings)
      addNotification('Settings updated successfully', 'success')
    } catch (error) {
      addNotification(`Failed to update settings: ${error.message}`, 'error')
      throw error
    }
  }
  
  return {
    scraperStatus: readonly(scraperStatus),
    settings,
    startScraping,
    getStatus,
    updateSettings
  }
}
