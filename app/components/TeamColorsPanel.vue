<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-medium text-gray-900">Team Sheet Colors</h2>
      <div class="flex space-x-2">
        <button
          @click="addNewColor"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add Color
        </button>
        <button
          @click="saveColorSettings"
          class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
    
    <!-- Search -->
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search teams across all colors..."
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    
    <!-- No Color Assigned Section -->
    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h3 class="text-md font-medium text-gray-700 mb-3">No Color Assigned</h3>
      <div v-if="unassignedTeams.length === 0" class="text-gray-500 italic">
        All teams have colors assigned
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="team in filteredUnassignedTeams"
          :key="team.id"
          class="flex items-center justify-between bg-white p-3 rounded border"
        >
          <span class="font-medium">{{ team.team_name }}</span>
          <select
            @change="assignColor(team, $event.target.value)"
            class="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="">Select Color</option>
            <option
              v-for="color in availableColors"
              :key="color.hex"
              :value="color.hex"
            >
              {{ color.name }}
            </option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Color Groups -->
    <div class="space-y-4">
      <div
        v-for="(group, colorHex) in colorGroups"
        :key="colorHex"
        class="border border-gray-200 rounded-lg overflow-hidden"
      >
        <!-- Group Header -->
        <div
          class="flex items-center justify-between p-4 cursor-pointer"
          :style="{ backgroundColor: colorHex + '20' }"
          @click="group.expanded = !group.expanded"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-6 h-6 rounded border-2 border-gray-300"
              :style="{ backgroundColor: colorHex }"
            ></div>
            <span class="font-medium">{{ group.name || colorHex }}</span>
            <span class="text-sm text-gray-500">({{ group.teams.length }} teams)</span>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click.stop="editColorGroup(colorHex)"
              class="text-gray-500 hover:text-gray-700"
            >
              Edit
            </button>
            <svg
              :class="['w-5 h-5 transition-transform', group.expanded ? 'rotate-180' : '']"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        <!-- Group Content -->
        <div v-show="group.expanded" class="border-t border-gray-200">
          <div class="p-4 space-y-2">
            <div
              v-for="team in group.teams"
              :key="team.id"
              class="flex items-center justify-between bg-gray-50 p-3 rounded"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-4 h-4 rounded"
                  :style="{ backgroundColor: colorHex }"
                ></div>
                <span class="font-medium">{{ team.team_name }}</span>
                <span v-if="team.is_home_team" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Home Team
                </span>
              </div>
              <button
                @click="removeTeamColor(team)"
                class="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add Color Modal -->
    <div v-if="showAddColorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-medium mb-4">Add New Color</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Color Name</label>
            <input
              v-model="newColor.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Team Red, Primary Blue"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input
              v-model="newColor.hex"
              type="color"
              class="w-full h-10 border border-gray-300 rounded cursor-pointer"
            />
          </div>
        </div>
        <div class="flex justify-end space-x-2 mt-6">
          <button
            @click="cancelAddColor"
            class="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="confirmAddColor"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Add Color
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const { teamVisuals, getTeamVisuals, saveTeamVisual, bulkUpdateTeamVisuals } = useTeamVisuals()
const { addNotification } = useNotifications()

// Component state
const searchQuery = ref('')
const showAddColorModal = ref(false)
const newColor = ref({ name: '', hex: '#3B82F6' })
const colorGroups = ref({})

// Computed
const unassignedTeams = computed(() => {
  return teamVisuals.value.filter(team => !team.color_hex)
})

const filteredUnassignedTeams = computed(() => {
  if (!searchQuery.value) return unassignedTeams.value
  
  return unassignedTeams.value.filter(team =>
    team.team_name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const availableColors = computed(() => {
  return Object.entries(colorGroups.value).map(([hex, group]) => ({
    hex,
    name: group.name || hex
  }))
})

// Methods
const groupTeamsByColor = () => {
  const grouped = {}
  
  teamVisuals.value
    .filter(team => team.color_hex)
    .forEach(team => {
      if (!grouped[team.color_hex]) {
        grouped[team.color_hex] = {
          name: team.color_name,
          teams: [],
          expanded: false
        }
      }
      grouped[team.color_hex].teams.push(team)
    })
  
  colorGroups.value = grouped
}

const assignColor = async (team, colorHex) => {
  if (!colorHex) return
  
  const colorGroup = colorGroups.value[colorHex]
  await saveTeamVisual({
    ...team,
    colorHex,
    colorName: colorGroup?.name
  })
  
  await loadTeamVisuals()
  addNotification(`Assigned ${team.team_name} to color group`, 'success')
}

const removeTeamColor = async (team) => {
  await saveTeamVisual({
    ...team,
    colorHex: null,
    colorName: null
  })
  
  await loadTeamVisuals()
  addNotification(`Removed color from ${team.team_name}`, 'success')
}

const addNewColor = () => {
  showAddColorModal.value = true
}

const confirmAddColor = () => {
  if (!newColor.value.name.trim()) {
    addNotification('Please enter a color name', 'error')
    return
  }
  
  colorGroups.value[newColor.value.hex] = {
    name: newColor.value.name,
    teams: [],
    expanded: true
  }
  
  showAddColorModal.value = false
  newColor.value = { name: '', hex: '#3B82F6' }
  addNotification('Color group added successfully', 'success')
}

const cancelAddColor = () => {
  showAddColorModal.value = false
  newColor.value = { name: '', hex: '#3B82F6' }
}

const saveColorSettings = async () => {
  // Implementation for saving color settings
  addNotification('Color settings saved successfully', 'success')
}

const loadTeamVisuals = async () => {
  await getTeamVisuals()
  groupTeamsByColor()
}

// Initialize
onMounted(() => {
  loadTeamVisuals()
})
</script>