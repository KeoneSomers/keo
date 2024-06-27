export default defineNuxtRouteMiddleware((to, from) => {
    // skip middleware on server
    if (import.meta.server) return

    const user = useSupabaseUser();

    // if user is not logged in - send them to the login page
    if (!user.value) {
        return navigateTo("/login");
    }
});
