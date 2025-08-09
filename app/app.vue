<template>
  <div class="bg-gray-900 min-h-screen">
    <header class="p-4 bg-gray-800 text-white">
      <nav class="flex gap-4">
        <NuxtLink to="/">Dashboard</NuxtLink>
        <NuxtLink to="/matches">Matches</NuxtLink>
        <NuxtLink to="/team-visuals">Team Visuals</NuxtLink>
      </nav>
    </header>

    <!-- This renders the page component based on the current route -->
    <NuxtPage />
  </div>
</template>
