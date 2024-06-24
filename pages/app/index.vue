<script setup>
import { watchDebounced, useThrottleFn } from "@vueuse/core";

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

const throttledFnCreateNewTask = useThrottleFn(() => {
  // do something, it will be called at most 1 time per 1.5 seconds
  createNewTask();
}, 1500);

const createNewTask = async () => {
  // create gpt chat thread for the task
  const { data: thread } = await useFetch("/api/openai/threads/create");
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
  if (taskId === selectedTask.value.id) {
    // Prevent re-selecting a task thats already selected (prevent spam clicking)
    return;
  }

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

const isOpenDeleteConfirmation = ref(false);
const isOpenClearConfirmation = ref(false);

const taskOptions = [
  [
    {
      label: "Clear Chat",
      icon: "i-heroicons-chat-bubble-left-20-solid",
      click: () => {
        console.log("Clear Chat");
        isOpenClearConfirmation.value = true;
      },
    },
    {
      label: "Delete Task",
      icon: "i-heroicons-trash-20-solid",
      click: () => {
        console.log("Delete Task");
        isOpenDeleteConfirmation.value = true;
      },
    },
  ],
];

const clearChat = async () => {
  console.log("here");
  // create a new thread
  const { data: thread } = await useFetch("/api/openai/threads/create");
  console.log(thread.value.id);

  if (!thread.value) {
    console.log(
      "No new thread was created and returned. Aborting refresh thread."
    );
    return;
  }

  let oldThreadId = selectedTask.value.chat_thread_id;
  selectedTask.value.chat_thread_id = thread.value.id;

  // update chat_thread_id in database
  const { error } = await supabase
    .from("tasks")
    .update({ chat_thread_id: thread.value.id })
    .eq("id", selectedTask.value.id);

  // delete old thread
  const { id, object, deleted } = await $fetch("/api/openai/threads/delete", {
    method: "post",
    body: {
      thread_id: oldThreadId,
    },
  });

  if (!deleted) {
    console.log("Error deleting old chat thread, aborting task deletion.");
    return;
  }

  isOpenClearConfirmation.value = false;
};

const deleteTask = async () => {
  // Delete the Chat thread and the task
  const { id, object, deleted } = await $fetch("/api/openai/threads/delete", {
    method: "post",
    body: {
      thread_id: selectedTask.value.chat_thread_id,
    },
  });

  if (!deleted) {
    console.log("Error deleting chat thread, aborting task deletion.");
    return;
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", selectedTask.value.id);

  if (error) {
    console.log(error.message);
    return;
  }

  // update local state
  tasks.value = tasks.value.filter((item) => item.id !== selectedTask.value.id);
  selectedTask.value = null;
  isOpenDeleteConfirmation.value = false;
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
        <UButton @click="throttledFnCreateNewTask" block color="black"
          >New Task</UButton
        >
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
      <div class="m-4">
        <!-- Keo Plus Promo -->
        <div
          class="bg-indigo-900/50 rounded-lg mb-2 p-4 cursor-pointer hover:bg-indigo-900/75"
        >
          <p class="text-sm">Upgrade to Keo Plus!</p>
          <p class="opacity-50 text-xs">Coming soon...</p>
        </div>
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
        <div class="p-1 border-b dark:border-zinc-800 flex items-center">
          <div class="flex-1">
            <UInput
              v-model="title"
              placeholder="Give this task a name..."
              size="xl"
              variant="none"
              class="p-0.5"
            />
          </div>
          <div class="pr-2">
            <UDropdown
              :items="taskOptions"
              :popper="{ placement: 'bottom-start' }"
            >
              <UButton
                color="white"
                label="Options"
                trailing-icon="i-heroicons-chevron-down-20-solid"
              />
            </UDropdown>
          </div>
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

    <UModal v-model="isOpenClearConfirmation">
      <div class="p-4">
        <div class="sm:flex sm:items-start">
          <div
            class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10 sm:mx-0 sm:h-10 sm:w-10"
          >
            <UIcon
              name="i-heroicons-exclamation-triangle-20-solid"
              class="h-6 w-6 text-red-600"
            />
          </div>
          <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
            <DialogTitle
              as="h3"
              class="text-base font-semibold leading-6 text-zinc-100"
              >Clear chat</DialogTitle
            >
            <div class="mt-2">
              <p class="text-sm text-gray-400">
                Are you sure you want to clear the chat history for this task?
                All of your messages will be permanently removed. This action
                cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <UButton color="red" class="ml-3" @click="clearChat">
            Clear Chat
          </UButton>
          <UButton
            color="gray"
            @click="isOpenClearConfirmation = false"
            ref="cancelButtonRef"
          >
            Cancel
          </UButton>
        </div>
      </div>
    </UModal>
    <UModal v-model="isOpenDeleteConfirmation">
      <div class="p-4">
        <div class="sm:flex sm:items-start">
          <div
            class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10 sm:mx-0 sm:h-10 sm:w-10"
          >
            <UIcon
              name="i-heroicons-exclamation-triangle-20-solid"
              class="h-6 w-6 text-red-600"
            />
          </div>
          <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
            <DialogTitle
              as="h3"
              class="text-base font-semibold leading-6 text-zinc-100"
              >Delete Task</DialogTitle
            >
            <div class="mt-2">
              <p class="text-sm text-gray-400">
                Are you sure you want to delete this task? All of it's data will
                be permanently removed. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <UButton color="red" class="ml-3" @click="deleteTask">
            Delete Task
          </UButton>
          <UButton
            color="gray"
            @click="isOpenDeleteConfirmation = false"
            ref="cancelButtonRef"
          >
            Cancel
          </UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>
