<script setup>
const supabase = useSupabaseClient();

supabase.auth.onAuthStateChange(async (event) => {
//  console.log(event);
    if (event === "SIGNED_IN") {
        await navigateTo("/app");
    }

    if (event === "SIGNED_OUT") {
        await navigateTo("/login");
    }
});
</script>

<template>
    <div class="dark:bg-zinc-950">
        <NuxtPage/>
    </div>
</template>
