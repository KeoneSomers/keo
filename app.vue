<script setup>
const searchQuery = ref("");

const supabase = useSupabaseClient();
</script>

<template>
  <div class="flex flex-col">
    <!-- <NuxtRouteAnnouncer /> -->
    <!-- <NuxtWelcome /> -->
    <div
      class="h-14 flex border-b dark:border-zinc-600 px-4 items-center justify-between"
    >
      <span class="font-mono font-bold text-purple-400">keo.dev</span>
      <span>Your Account</span>
    </div>
    <div class="flex flex-1">
      <div class="w-60 border-r dark:border-zinc-600">
        <div class="border-b border-zinc-700 border-dashed">
          <span class="opacity-50">
            <UInput
              v-model="searchQuery"
              icon="i-heroicons-magnifying-glass-20-solid"
              placeholder="Search..."
              variant="none"
              class="p-3 pl-0"
            />
          </span>
        </div>
        <div class="p-3 border-b border-zinc-700 border-dashed">
          <UButton block color="black">New Task</UButton>
        </div>
        <div class="p-4 border-b border-zinc-700 border-dashed">
          <span class="opacity-50">Your task</span>
        </div>
      </div>
      <div class="flex flex-1">
        <div class="flex flex-col flex-1 border-r dark:border-zinc-600">
          <Editor />
        </div>
        <div class="flex-1 p-4">
          <Chat />
        </div>
      </div>
    </div>
  </div>
</template>
