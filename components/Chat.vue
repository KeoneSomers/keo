<script setup>
const notesMarkdown = useState("notesMarkdown", () => "");
</script>

<template>
  <div>
    {{ notesMarkdown }}
  </div>
</template>
