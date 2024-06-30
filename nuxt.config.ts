// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: {enabled: true},
    modules: [
        "@nuxt/ui",
        "@nuxtjs/color-mode",
        "nuxt-tiptap-editor",
        "@nuxtjs/supabase",
        "@vueuse/nuxt",
    ],
    supabase: {
        redirect: false,
    },
    runtimeConfig: {
        // Private keys are only available on the server
        openaiApiKey: process.env.OPENAI_API_KEY,
        // Public keys that also need to be exposed to the client
        public: {
            publicApiKey: process.env.PUBLIC_API_KEY,
        },
    },
    app: {
        head: {
            title: "Keo",
            htmlAttrs: {
                lang: "en",
            },
            meta: [
                {
                    name: "og:site_name",
                    content: "Keo",
                },
                {
                    name: "og:title",
                    content: "Keo",
                },
                {
                    name: "description",
                    content:
                        "Private task management for induviduals. An AI assistant and notes for each task.",
                },
                {
                    name: "og:description",
                    content:
                        "Private task management for induviduals. An AI assistant and notes for each task.",
                },
                {
                    name: "keywords",
                    content:
                        "task management, todo app, todo list ai, ai notes",
                },
                {name: "author", content: "Keo"},
            ],
        },
    },
});
