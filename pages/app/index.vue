<script setup>
import { watchDebounced } from "@vueuse/core";
import { formatRelative } from "date-fns";

definePageMeta({
  middleware: ["require-auth"],
});

const supabase = useSupabaseClient();

const title = ref("");
const isCompleted = ref(false);

const clearChatLoading = ref(false);
const deleteLoading = ref(false);

const tasks = useState("tasks", () => []);
const selectedTask = useState("selectedTask", () => null);

console.log(selectedTask.value);

watchEffect(async () => {
  if (selectedTask.value) {
    title.value = selectedTask.value.title;
    isCompleted.value = selectedTask.value.completed_at !== null;
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
  const currentDate = new Date();
  const currentDatetimeZ = currentDate.toISOString();

  const { error } = await supabase
    .from("tasks")
    .update({ title: title.value, updated_at: currentDatetimeZ })
    .eq("id", selectedTask.value.id);

  if (error) {
    console.log(error);
    return;
  }

  // update local state
  selectedTask.value.title = title.value;
  selectedTask.value.updated_at = currentDatetimeZ;

  // For the title - also need to update it in the sidebar list
  const index = tasks.value.findIndex(
    (item) => item.id === selectedTask.value.id
  );
  tasks.value[index].title = title.value;
  tasks.value[index].updated_at = currentDatetimeZ;
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
  clearChatLoading.value = true;
  console.log("here");
  // create a new thread
  const { data: thread } = await useFetch("/api/openai/threads/create");
  console.log(thread.value.id);

  if (!thread.value) {
    console.log(
      "No new thread was created and returned. Aborting refresh thread."
    );
    clearChatLoading.value = false;
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
    clearChatLoading.value = false;
    return;
  }

  isOpenClearConfirmation.value = false;
  clearChatLoading.value = false;
};

const deleteTask = async () => {
  // Delete the Chat thread and the task
  deleteLoading.value = true;
  const { id, object, deleted } = await $fetch("/api/openai/threads/delete", {
    method: "post",
    body: {
      thread_id: selectedTask.value.chat_thread_id,
    },
  });

  if (!deleted) {
    console.log("Error deleting chat thread, aborting task deletion.");
    deleteLoading.value = false;
    return;
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", selectedTask.value.id);

  if (error) {
    console.log(error.message);
    deleteLoading.value = false;
    return;
  }

  // update local state
  tasks.value = tasks.value.filter((item) => item.id !== selectedTask.value.id);
  selectedTask.value = null;
  isOpenDeleteConfirmation.value = false;
  deleteLoading.value = false;
};

// debounced saving isCompleted value
watchDebounced(
  isCompleted,
  () => {
    if (
      selectedTask.value &&
      isCompleted.value !== (selectedTask.value.completed_at !== null)
    ) {
      saveIsCompleted();
    }
  },
  { debounce: 1000, maxWait: 5000 }
);

const saveIsCompleted = async () => {
  console.log("Saving isCompleted");

  const currentDate = new Date();
  const currentDatetimeZ = currentDate.toISOString();

  const { error } = await supabase
    .from("tasks")
    .update({
      completed_at: isCompleted.value === true ? currentDatetimeZ : null,
    })
    .eq("id", selectedTask.value.id);

  if (error) {
    console.log(error);
    return;
  }

  // update local state
  selectedTask.value.completed_at =
    isCompleted.value === true ? currentDatetimeZ : null;

  // For the isCompleted - also need to update it in the sidebar list
  const index = tasks.value.findIndex(
    (item) => item.id === selectedTask.value.id
  );
  tasks.value[index].completed_at =
    isCompleted.value === true ? currentDatetimeZ : null;
};
</script>

<template>
  <ClientOnly>
    <div>
      <div class="grid grid-cols-2 w-screen">
        <!-- Sidebar -->
        <div class="w-64">
          <Sidebar />
        </div>

        <!-- Main -->
        <div class="p-2 pl-0 h-screen flex-1">
          <div
            v-if="selectedTask"
            class="flex flex-col relative flex-1 shadow-sm pl-0 rounded-lg overflow-hidden dark:border-zinc-800 border bg-white dark:bg-zinc-900"
          >
            <div class="p-1 border-b dark:border-zinc-800 flex items-center">
              <div class="pl-3 flex items-center">
                <UTooltip
                  :text="
                    isCompleted === false
                      ? 'Mark as complete'
                      : 'Mark as incomplete'
                  "
                >
                  <UCheckbox v-model="isCompleted" />
                </UTooltip>
              </div>
              <div class="flex-1">
                <UInput
                  v-model="title"
                  placeholder="Give this task a name..."
                  size="xl"
                  variant="none"
                  class="p-0.5"
                  :class="{ 'line-through': isCompleted }"
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
              <div class="flex flex-col flex-1 dark:border-zinc-800 border-r">
                <Editor />
              </div>
              <div class="w-96">
                <Chat />
              </div>
            </div>
            <div
              class="absolute bottom-2 flex items-center left-2 text-xs border dark:border-zinc-600 rounded-full px-1 pr-2 py-1 opacity-75"
            >
              <UIcon
                name="i-heroicons-check-circle-20-solid"
                class="h-4 w-4 text-green-600 mr-1"
              />
              Last saved
              {{
                selectedTask.updated_at !== null
                  ? formatRelative(selectedTask.updated_at, new Date())
                  : formatRelative(selectedTask.created_at, new Date())
              }}
            </div>
          </div>
          <div
            v-else
            class="h-[calc(100vh-16px)] flex flex-1 justify-center items-center border rounded-lg bg-white dark:bg-zinc-900 dark:border-zinc-800"
          >
            <span class="opacity-45">No task selected.</span>
          </div>
        </div>
      </div>
      <!-- Modal: Clear Chat-->
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
              <h3
                class="text-base font-semibold leading-6 text-zinc-800 dark:text-zinc-100"
              >
                Clear chat
              </h3>
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
            <UButton
              :loading="clearChatLoading"
              color="red"
              class="ml-3"
              @click="clearChat"
            >
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

      <!--Modal: Delete Task-->
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
              <h3
                class="text-base font-semibold leading-6 text-zinc-800 dark:text-zinc-100"
              >
                Delete Task
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-400">
                  Are you sure you want to delete this task? All of it's data
                  will be permanently removed. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <UButton
              :loading="deleteLoading"
              color="red"
              class="ml-3"
              @click="deleteTask"
            >
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
  </ClientOnly>
</template>

<style scoped>
.grid {
  grid-template-columns: auto 1fr;
}
</style>
