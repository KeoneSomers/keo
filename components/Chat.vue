<script setup>
const notesMarkdown = useState("notesMarkdown", () => "");
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex-1">
      {{ notesMarkdown }}
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
