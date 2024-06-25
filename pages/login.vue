<script setup>
definePageMeta({
  middleware: ["require-no-auth"],
});

const supabase = useSupabaseClient();

const state = reactive({
  email: "",
  password: "",
});

const errors = ref([]);

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

  const { data, error } = await supabase.auth.signInWithPassword({
    email: state.email,
    password: state.password,
  });

  if (error) {
    errors.value.push(error);
    return;
  }
};
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <div class="w-96">
      <div class="mb-4 pb-4 border-b-zinc-700 border-b">
        <div class="text-2xl">Login</div>
        <ULink to="/" class="text-xs flex items-center mt-2 opacity-50"
          ><UIcon name="i-heroicons-arrow-left-16-solid" class="mr-1" /> Back to
          homepage</ULink
        >
      </div>
      <UForm :state="state" @submit="login" class="space-y-4">
        <UFormGroup label="Email" name="email">
          <UInput v-model="state.email" type="email" :autofocus="true" />
        </UFormGroup>

        <UFormGroup label="Password" name="password">
          <UInput v-model="state.password" type="password" />
        </UFormGroup>

        <UButton type="submit" block>Login</UButton>
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
  </div>
</template>
