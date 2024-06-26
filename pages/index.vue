<script setup lang="ts">
definePageMeta({
  middleware: ["require-anonymous"],
});
</script>

<template>
  <div>
    <Hero />
    <Features />
    <FooterSection />
  </div>
</template>
