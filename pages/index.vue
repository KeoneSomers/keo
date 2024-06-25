<script setup>
definePageMeta({
  middleware: ["require-no-auth"],
});
</script>

<template>
  <div>
    <Hero />
    <Features />
    <FooterSection />
  </div>
</template>
