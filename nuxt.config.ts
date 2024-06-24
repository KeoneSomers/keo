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
    redirect: true,
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      include: undefined,
      exclude: ["/signup", "/"],
      cookieRedirect: false,
    },
    clientOptions: {
      auth: {
        persistSession: true,
      },
    },
  },
  runtimeConfig: {
    // Private keys are only available on the server
    openaiApiKey: process.env.OPENAI_API_KEY,
    // Public keys that also need to be exposed to the client
    public: {
      publicApiKey: process.env.PUBLIC_API_KEY,
    },
  },
});
