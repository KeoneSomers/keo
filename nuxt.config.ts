// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "@nuxt/ui",
    "@nuxtjs/color-mode",
    "nuxt-tiptap-editor",
    "@nuxtjs/supabase",
    "@vueuse/nuxt",
  ],
  colorMode: {
    preference: "dark",
  },
  supabase: {
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      include: undefined,
      exclude: ["/signup"],
      cookieRedirect: false,
    },
  },
});
