<script setup>
const supabase = useSupabaseClient();

supabase.auth.onAuthStateChange(async (event) => {
  console.log(event);
  if (event === "SIGNED_IN") {
    await navigateTo("/app");
  }

  if (event === "SIGNED_OUT") {
    await navigateTo("/login");
  }
});
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>

<style>
html,
body {
  overflow: hidden;
}
</style>
