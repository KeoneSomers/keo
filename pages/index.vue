<script setup>
const searchQuery = ref("");

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const tasks = useState("tasks", () => []);
const selectedTask = useState("selectedTask", () => null);

const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log(error);
    return;
  }

  await navigateTo("/login");
};

const accountDropdownItems = [
  [
    {
      label: "Logout",
      icon: "i-heroicons-arrow-left-end-on-rectangle",
      click: () => {
        signOut();
      },
    },
  ],
];

const getTasks = async () => {
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title")
    .eq("created_by", user.value.id);

  console.log(data);

  if (error) {
    console.log(error);
    return;
  }

  tasks.value = data;
};

getTasks();

const createNewTask = async () => {
  // Create task in superbase
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      created_by: user.value.id,
      title: null,
      notes: null,
    })
    .select()
    .single();

  if (error) {
    console.log(error);
    return;
  }

  selectedTask.value = data;

  // Update local state
  tasks.value.push(data);
};

const selectTask = async (taskId) => {
  const { data, error } = await supabase
    .from("tasks")
    .select()
    .single()
    .eq("id", taskId);

  console.log(data);

  if (error) {
    console.log(error);
    return;
  }

  selectedTask.value = data;
};
</script>

<template>
  <div class="flex flex-col">
    <div
      class="h-14 flex border-b dark:border-zinc-600 px-4 items-center justify-between"
    >
      <span class="font-mono font-bold">keo.dev</span>
      <!-- <span>{{ user.email }}</span>
      <UButton @click="signOut">Logout</UButton> -->
      <UDropdown
        :items="accountDropdownItems"
        :popper="{ placement: 'bottom-start' }"
      >
        <UButton
          color="white"
          :label="user.email"
          trailing-icon="i-heroicons-chevron-down-20-solid"
        />
      </UDropdown>
    </div>
    <div class="flex flex-1">
      <div class="w-60 border-r dark:border-zinc-600">
        <div class="border-b border-zinc-700 border-dashed">
          <span class="opacity-50">
            <UInput
              v-model="searchQuery"
              icon="i-heroicons-magnifying-glass-20-solid"
              placeholder="Search..."
              variant="none"
              class="p-3 pl-0"
            />
          </span>
        </div>
        <div class="p-3 border-b border-zinc-700 border-dashed">
          <UButton @click="createNewTask" block color="black">New Task</UButton>
        </div>
        <div
          v-for="task in tasks"
          :key="task.id"
          @click="selectTask(task.id)"
          class="px-4 py-3 m-2 rounded border-b border-zinc-700 border-dashed hover:bg-zinc-800 cursor-pointer"
          :class="[
            {
              'bg-zinc-800':
                selectedTask !== null && task.id === selectedTask.id,
            },
            {
              'opacity-50':
                selectedTask === null ||
                (selectedTask !== null && task.id !== selectedTask.id),
            },
          ]"
        >
          <span>{{
            task.title === "" || task.title === null
              ? "Unnamed Task"
              : task.title
          }}</span>
        </div>
      </div>
      <div class="flex flex-1">
        <div class="flex flex-col flex-1 border-r dark:border-zinc-600">
          <Editor />
        </div>
        <div class="flex-1 p-4">
          <Chat />
        </div>
      </div>
    </div>
  </div>
</template>
