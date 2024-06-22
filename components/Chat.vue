<script setup>
const notesMarkdown = useState("notesMarkdown", () => "");

const message = ref("");
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex-1 flex flex-col justify-end">
      {{ notesMarkdown }}
      <div class="flex py-4">
        <span class="bg-indigo-500 py-2 px-3 rounded-lg">
          <span>Hey, user!</span>
        </span>
      </div>
      <div class="flex py-4 justify-end">
        <span class="bg-zinc-700 py-2 px-3 rounded-lg">
          <span>Hey, can you help me with this task?</span>
        </span>
      </div>
    </div>
    <div>
      <UInput
        placeholder="Chat..."
        size="xl"
        icon="i-heroicons-paper-airplane"
        :trailing="true"
      />
    </div>
  </div>
</template>
