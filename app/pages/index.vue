<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-6xl mx-auto px-6 py-4">
        <h1 class="text-2xl font-semibold text-blue-800">Calendar Sync Scraper</h1>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="max-w-6xl mx-auto px-6 py-6">
      <!-- Navigation Tabs -->
      <div class="mb-6">
        <nav class="flex space-x-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-gray-800 text-white'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            ]"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>
      
      <!-- Tab Content -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <!-- Main Tab -->
        <div v-if="activeTab === 'main'" class="space-y-6">
          <ScraperMainPanel />
        </div>
        
        <!-- Sheet Colors Tab -->
        <div v-else-if="activeTab === 'colors'" class="space-y-6">
          <TeamColorsPanel />
        </div>
        
        <!-- Log State Tab -->
        <div v-else-if="activeTab === 'logs'" class="space-y-6">
          <LogStatePanel />
        </div>
        
        <!-- Settings Tab -->
        <div v-else-if="activeTab === 'settings'" class="space-y-6">
          <SettingsPanel />
        </div>
        
        <!-- Teams Tab -->
        <div v-else-if="activeTab === 'teams'" class="space-y-6">
          <TeamsPanel />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const activeTab = ref('main')

const tabs = [
  { id: 'main', label: 'Main' },
  { id: 'colors', label: 'Sheet Colors' },
  { id: 'logs', label: 'Log State' },
  { id: 'settings', label: 'Settings' },
  { id: 'teams', label: 'Teams' }
]
</script>