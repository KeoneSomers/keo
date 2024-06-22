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
    .eq("created_by", user.value.id)
    .order("id", { ascending: false });

  console.log(data);

  if (error) {
    console.log(error);
    return;
  }

  tasks.value = data;

  // select the first task automatically
  if (tasks.value.length > 0) {
    await selectTask(tasks.value[0].id);
  }
};

getTasks();

const filteredAndSortedTasks = computed(() => {
  // Filter items based on search string
  let filteredItems = tasks.value.filter((item) => {
    if (searchQuery.value === "") {
      return true;
    } else {
      return (
        item.title !== null &&
        item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    }
  });

  // Sort items by create_at date
  filteredItems.sort((a, b) => {
    return b.id - a.id;
  });

  return filteredItems;
});

const createNewTask = async () => {
  // create gpt chat thread for the task
  const { data: thread } = await useFetch("/api/createChatThread");
  console.log(thread.value.id);

  if (!thread.value) {
    console.log("No thread was created and returned.");
    return;
  }

  // Create task in superbase
  const { data: newTask, error } = await supabase
    .from("tasks")
    .insert({
      created_by: user.value.id,
      title: null,
      notes: null,
      chat_thread_id: thread.value.id,
    })
    .select()
    .single();

  if (error) {
    console.log(error);
    return;
  }

  selectedTask.value = newTask;

  // Update local state
  tasks.value.push(newTask);
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
  console.log(data);
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
          v-for="task in filteredAndSortedTasks"
          :key="task.id"
          @click="selectTask(task.id)"
          class="px-4 py-3 m-2 text-sm rounded border-b border-zinc-700 border-dashed hover:bg-zinc-800 cursor-pointer truncate"
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
      <div v-if="selectedTask" class="flex flex-1">
        <div class="flex flex-col flex-1 border-r dark:border-zinc-600">
          <Editor />
        </div>
        <div class="flex-1 p-4">
          <Chat />
        </div>
      </div>
      <div
        v-else
        class="h-[calc(100vh-56px)] flex flex-1 justify-center items-center"
      >
        <span class="opacity-45">No task selected.</span>
      </div>
    </div>
  </div>
</template>
