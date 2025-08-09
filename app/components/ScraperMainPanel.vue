<template>
  <div class="space-y-6">
    <!-- Configuration Form -->
    <div class="grid grid-cols-1 gap-6">
      <!-- Season Selection -->
     <div class="flex items-center relative">
          <label class="text-sm font-medium text-gray-700 w-32 flex-shrink-0">
            Season:
          </label>
          <select
            v-model="settings.season"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 z-10"
          >
            <option value="2024/2025">2024/2025</option>
            <option value="2023/2024">2023/2024</option>
            <option value="2025/2026">2025/2026</option>
          </select>
        </div>
      
      <!-- Link Structure -->
      <div class="flex items-start">
        <label class="text-sm font-medium text-gray-700 w-32 flex-shrink-0 mt-2">
          Link Structure:
        </label>
        <textarea 
          v-model="settings.linkStructure"
          readonly
          class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-sm font-mono"
          rows="2"
        />
      </div>
      
      <!-- Venue -->
      <div class="flex items-center">
        <label class="text-sm font-medium text-gray-700 w-32 flex-shrink-0">
          Venue:
        </label>
        <input 
          v-model="settings.venue"
          type="text"
          placeholder="Enter venue name"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
    
    <!-- Action Buttons -->
    <div class="flex flex-wrap gap-3 justify-between">
      <!-- Autorun Toggle -->
      <button
        @click="toggleAutorun"
        :class="[
          'px-4 py-2 rounded-lg font-medium border-2 transition-all',
          settings.autorun
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
        ]"
      >
        Autorun: {{ settings.autorun ? 'On' : 'Off' }}
      </button>
      
      <!-- Run Scraper -->
      <button
        @click="runScraper"
        :disabled="scraperStatus.isRunning"
        class="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Run Scraper Now
      </button>
      
      <!-- Clear All Matches -->
      <button
        @click="showClearMatchesConfirm = true"
        class="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
      >
        Clear All Matches
      </button>
      
      <!-- Clear All Logs -->
      <button
        @click="showClearLogsConfirm = true"
        class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
      >
        Clear All Logs
      </button>
    </div>
    
    <!-- Status Display -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="text-sm text-gray-700 space-y-1">
        <div v-if="scraperStatus.isScheduled" class="text-blue-800">
          <span class="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Scraper scheduled to run at midnight (in {{ timeUntilMidnight }} minutes) for venue: {{ settings.venue }}
        </div>
        <div v-if="scraperStatus.isRunning" class="text-green-800">
          <span class="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Scraper is currently running...
        </div>
        <div v-if="scraperStatus.lastRun" class="text-gray-600">
          Last run: {{ formatDateTime(scraperStatus.lastRun) }}
        </div>
      </div>
    </div>
    
    <!-- Matches Display -->
    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-3">Scraped Matches</h3>
      <div v-if="matches.length === 0" class="text-gray-500 py-8 text-center">
        No matches to display yet.
      </div>
      <div v-else class="space-y-2">
        <MatchCard
          v-for="match in matches"
          :key="match.id"
          :match="match"
        />
      </div>
    </div>
    
    <!-- Confirmation Modals -->
    <ConfirmDialog
      v-model="showClearMatchesConfirm"
      title="Clear All Matches"
      message="Are you sure you want to clear all matches? This action cannot be undone."
      confirm-text="Clear Matches"
      @confirm="clearAllMatches"
    />
    
    <ConfirmDialog
      v-model="showClearLogsConfirm"
      title="Clear All Logs"
      message="Are you sure you want to clear all logs? This action cannot be undone."
      confirm-text="Clear Logs"
      @confirm="clearAllLogs"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const { settings, scraperStatus, updateSettings } = useScraper()
const { matches, clearMatches } = useMatches()
const { clearLogs } = useLogs()
const { addNotification } = useNotifications()

// Component state
const showClearMatchesConfirm = ref(false)
const showClearLogsConfirm = ref(false)
const timeInterval = ref(null)

// Initialize default settings
onMounted(() => {
  settings.value = {
    season: '2024/2025',
    linkStructure: 'https://www.bordtennisportalen.dk/DBTU/HoldTurnering/Stilling/#4.{season}.{pool}.{group}.{region}...',
    venue: '',
    autorun: true
  }
  
  // Update time until midnight every minute
  timeInterval.value = setInterval(updateTimeUntilMidnight, 60000)
})

onUnmounted(() => {
  if (timeInterval.value) {
    clearInterval(timeInterval.value)
  }
})

// Computed properties
const timeUntilMidnight = computed(() => {
  const now = new Date()
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0)
  
  const diff = midnight - now
  return Math.floor(diff / (1000 * 60))
})

// Methods
const toggleAutorun = async () => {
  settings.value.autorun = !settings.value.autorun
  await updateSettings({ autorun: settings.value.autorun })
  
  addNotification(
    `Autorun ${settings.value.autorun ? 'enabled' : 'disabled'}`,
    'success'
  )
}

const runScraper = async () => {
  if (!settings.value.venue.trim()) {
    addNotification('Please enter a venue name', 'error')
    return
  }
  
  try {
    await startScraping({
      venue: settings.value.venue,
      season: settings.value.season
    })
  } catch (error) {
    addNotification(`Failed to start scraper: ${error.message}`, 'error')
  }
}

const clearAllMatches = async () => {
  try {
    await clearMatches()
    addNotification('All matches cleared successfully', 'success')
  } catch (error) {
    addNotification(`Failed to clear matches: ${error.message}`, 'error')
  }
  showClearMatchesConfirm.value = false
}

const clearAllLogs = async () => {
  try {
    await clearLogs()
    addNotification('All logs cleared successfully', 'success')
  } catch (error) {
    addNotification(`Failed to clear logs: ${error.message}`, 'error')
  }
  showClearLogsConfirm.value = false
}

const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString()
}

const updateTimeUntilMidnight = () => {
  // Force reactivity update
  timeUntilMidnight.value
}
</script>