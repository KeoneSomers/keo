<script setup>
import { watchDebounced } from "@vueuse/core";

const searchQuery = ref("");

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const title = ref("");

const tasks = useState("tasks", () => []);
const selectedTask = useState("selectedTask", () => null);

watchEffect(async () => {
  if (selectedTask.value) {
    title.value = selectedTask.value.title;
  }
});

// debounced saving
watchDebounced(
  title,
  () => {
    if (selectedTask.value && title.value !== selectedTask.value.title) {
      saveTitle();
    }
  },
  { debounce: 1000, maxWait: 5000 }
);

const saveTitle = async () => {
  console.log("Saving title");
  const { error } = await supabase
    .from("tasks")
    .update({ title: title.value })
    .eq("id", selectedTask.value.id);

  if (error) {
    console.log(error);
    return;
  }

  // update local state
  selectedTask.value.title = title.value;

  // For the title - also need to update it in the sidebar list
  const index = tasks.value.findIndex(
    (item) => item.id === selectedTask.value.id
  );
  tasks.value[index].title = title.value;
};

const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log(error);
    return;
  }
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

  // console.log(data);

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
  <div class="flex">
    <!-- Sidebar -->
    <div class="w-64 overflow-y-auto h-screen flex flex-col">
      <div class="px-4 py-4">
        <span class="font-mono font-bold">keo.dev</span>
      </div>

      <div class="p-4">
        <UButton @click="createNewTask" block color="black">New Task</UButton>
      </div>
      <!-- search bar -->
      <div class="border-zinc-700">
        <span class="opacity-50">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass-20-solid"
            placeholder="Search..."
            class="mx-4 mb-2"
          />
        </span>
      </div>
      <!-- tasks list -->
      <div class="flex-1 overflow-y-auto">
        <div
          v-for="task in filteredAndSortedTasks"
          :key="task.id"
          @click="selectTask(task.id)"
          class="p-2 mx-4 my-1 text-sm rounded-lg border-zinc-700 border-dashed hover:bg-zinc-800 cursor-pointer truncate"
          :class="[
            {
              'bg-zinc-900':
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

      <!-- account dropdown -->
      <div class="bg-zinc-900 rounded-lg m-4">
        <UDropdown
          :items="accountDropdownItems"
          :popper="{ placement: 'bottom-start' }"
        >
          <UButton
            color="white"
            :label="user.email"
            trailing-icon="i-heroicons-chevron-down-20-solid"
            block
            truncate
          />
        </UDropdown>
      </div>
    </div>
    <div class="p-2 flex-1 pl-0 h-screen">
      <div
        v-if="selectedTask"
        class="flex flex-col flex-1 pl-0 rounded-lg overflow-hidden dark:border-zinc-800 border bg-zinc-900"
      >
        <div class="p-1 border-b dark:border-zinc-800">
          <UInput
            v-model="title"
            placeholder="Give this task a name..."
            size="xl"
            variant="none"
            class="p-0.5"
          />
        </div>
        <div class="flex">
          <div
            class="flex flex-col flex-1 dark:border-zinc-800 border-r bg-zinc-900"
          >
            <Editor />
          </div>
          <div class="flex-1 bg-zinc-900">
            <Chat />
          </div>
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
