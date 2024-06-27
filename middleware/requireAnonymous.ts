export default defineNuxtRouteMiddleware((to, from) => {

    // skip middleware on server
    if (import.meta.server) return

    // console.log("Running the 'Require No Auth' Middleware!");
    const user = useSupabaseUser();

    // if user is logged in - send them to the yards page
    if (user.value) {
        return navigateTo("/app");
    }
});
