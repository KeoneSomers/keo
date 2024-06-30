<script setup lang="ts">
definePageMeta({
    middleware: ["require-anonymous"],
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const requestPasswordResetModalOpen = ref(false)
const resetEmail = ref("");
const toast = useToast();
const loadingEmail = ref(false)

const state = reactive({
    email: "",
    password: "",
});

const errors = ref<string[]>([]);

const login = async () => {
    errors.value = [];

    if (
        state.email.length < 6 ||
        !state.email.includes("@") ||
        !state.email.includes(".")
    ) {
        errors.value.push("Please enter a valid email address.");
        return;
    }

    if (state.password.length < 6) {
        return;
    }

    const {error} = await supabase.auth.signInWithPassword({
        email: state.email,
        password: state.password,
    });

    if (error) {
        errors.value.push(error.message);
        return;
    }
};

const sendResetEmail = async () => {
    loadingEmail.value = true;
    console.log(resetEmail.value)
    if (resetEmail.value.length < 6 ||
        !resetEmail.value.includes("@") ||
        !resetEmail.value.includes(".")) {
        console.log("Invalid Email")
        loadingEmail.value = false;
        return;
    }

    const {data, error} = await supabase.auth.resetPasswordForEmail(resetEmail.value, {
        redirectTo: `${window.location.origin}/auth/reset`,
    })

    if (error) {
        // errorMessage.value = error.message;
        toast.add({
            title: "Error!",
            description: "Please try again, or contact support.",
        });

        loadingEmail.value = false;
        return;
    }

    toast.add({
        title: "Success!",
        description:
            "Please check your email. You should receive an email within a few minutes.",
    });

    // close the modal
    resetEmail.value = "";
    requestPasswordResetModalOpen.value = false;
    loadingEmail.value = false;
}
</script>

<template>
    <div v-if="!user" class="flex justify-center items-center h-screen">
        <div class="w-96">
            <div class="mb-4 pb-4 border-b-zinc-700 border-b">
                <div class="text-2xl">Login</div>
                <ULink to="/" class="text-xs flex items-center mt-2 opacity-50"
                >
                    <UIcon name="i-heroicons-arrow-left-16-solid" class="mr-1"/>
                    Back to
                    homepage
                </ULink
                >
            </div>
            <UForm :state="state" @submit="login" class="space-y-4">
                <UFormGroup label="Email" name="email">
                    <UInput v-model="state.email" type="email" :autofocus="true"/>
                </UFormGroup>

                <UFormGroup label="Password" name="password">
                    <UInput v-model="state.password" type="password"/>
                </UFormGroup>

                <div class="my-4 opacity-75 text-xs text-center flex justify-end">
                    <UButton @click="() => (requestPasswordResetModalOpen = true)" variant="link" color="black">Forgot
                        password?
                    </UButton>
                </div>

                <UButton type="submit" block color="black">Login</UButton>
            </UForm>
            <div class="my-4 opacity-75 text-xs text-center">
                <ULink to="/signup">Don't have an account? Sign up!</ULink>
            </div>

            <div
                v-for="error in errors"
                class="my-4 bg-red-500/70 rounded p-2 text-red-300 border-red-500 border"
            >
                {{ error }}
            </div>
        </div>

        <UModal v-model="requestPasswordResetModalOpen">
            <div class="p-4">
                <form @submit.prevent="sendResetEmail">
                    <div class="sm:flex sm:items-start">
                        <div
                            class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10"
                        >
                            <UIcon
                                name="i-heroicons-key"
                                class="h-6 w-6 text-orange-600"
                                aria-hidden="true"
                            />
                        </div>
                        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <div class="mt-2">
                                <p class="text-sm text-gray-500">
                                    Please enter the email you used to create your account.
                                </p>
                            </div>
                            <div class="relative mt-4 rounded-md shadow-sm">
                                <div
                                    class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                                >
                                    <UIcon
                                        name="i-heroicons-envelope-solid"
                                        class="h-5 w-5 text-gray-400"
                                        aria-hidden="true"
                                    />
                                </div>
                                <UInput
                                    v-model="resetEmail"
                                    type="email"
                                    name="email"
                                    required
                                    id="email"
                                    class="block w-full rounded-md border-gray-300 pl-10 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>
                    </div>
                    <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <UButton
                            type="submit"
                            :loading="loadingEmail"
                        >
                            Send reset email
                        </UButton>
                    </div>
                </form>
            </div>
        </UModal>
    </div>
</template>
