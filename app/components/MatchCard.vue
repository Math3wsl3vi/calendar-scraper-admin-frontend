<template>
  <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <!-- Match Info -->
        <div class="flex-1">
          <div class="font-medium text-gray-900">
            {{ match.home_team }} vs {{ match.away_team }}
          </div>
          <div class="text-sm text-gray-500">
            {{ formatDate(match.match_date) }} at {{ formatTime(match.match_time) }}
          </div>
          <div class="text-sm text-gray-500">
            {{ match.venue }}
          </div>
        </div>
        
        <!-- Status Badge -->
        <div class="flex-shrink-0">
          <span
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              getStatusColor(match.status)
            ]"
          >
            {{ getStatusText(match.status) }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Additional Info -->
    <div v-if="match.age_group || match.pool" class="mt-2 flex space-x-4 text-sm text-gray-500">
      <span v-if="match.age_group">Age Group: {{ match.age_group }}</span>
      <span v-if="match.pool">Pool: {{ match.pool }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  match: {
    type: Object,
    required: true
  }
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const formatTime = (time) => {
  return time.slice(0, 5) // HH:MM format
}

const getStatusColor = (status) => {
  switch (status) {
    case 'scraped':
      return 'bg-blue-100 text-blue-800'
    case 'wp_created':
      return 'bg-green-100 text-green-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'skipped':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'scraped':
      return 'Scraped'
    case 'wp_created':
      return 'Added to WordPress'
    case 'failed':
      return 'Failed'
    case 'skipped':
      return 'Skipped'
    default:
      return status
  }
}
</script>