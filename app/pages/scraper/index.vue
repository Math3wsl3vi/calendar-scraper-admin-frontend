<template>
  <div class="scraper-page">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Scraper Controls</h1>
      <ScraperStatus />
    </div>
    
    <!-- Main Controls -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <ScraperControls />
    </div>
    
    <!-- Settings -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-bold mb-4">Settings</h2>
      <ScraperSettings />
    </div>
    
    <!-- Live Logs -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-bold mb-4">Live Logs</h2>
      <ScraperLogs :live="true" />
    </div>
  </div>
</template>