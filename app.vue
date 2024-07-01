<script setup>
import {SpeedInsights} from '@vercel/speed-insights/vue';

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
    <div class="bg-zinc-50 dark:bg-zinc-950">
        <NuxtPage/>
        <UNotifications/>
        <SpeedInsights/>
    </div>
</template>
