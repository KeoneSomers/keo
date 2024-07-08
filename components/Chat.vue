<script setup>
import TurndownService from "turndown";
import { useResizeObserver } from "@vueuse/core";
import VueMarkdown from "vue-markdown-render";

const turndownService = new TurndownService({ headingStyle: "atx" });

const scrollContainer = ref(null);
const resize = ref(null);

const scrollToBottom = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
};

useResizeObserver(resize, (entries) => {
  scrollToBottom();
});

const notesMarkdown = useState("notesMarkdown", () => "");
const selectedTask = useState("selectedTask");
const welcomeMessage = {
  id: "0",
  content: [
    {
      text: {
        value:
          "Hey there! I'm an AI assistant happy to help you with this task.",
      },
    },
  ],
  role: "assistant",
};
const pendingMessage = ref(null);
const messages = ref([]);
const newMessage = ref("");
const loading = ref(false);

const getThreadMessages = async () => {
  const { data } = await useFetch(
    `/api/getThreadMessages?thread_id=${selectedTask.value.chat_thread_id}`
  );
  //  console.log(data.value);

  messages.value = [welcomeMessage, ...data.value];

  //    console.log(messages.value)
};

watchEffect(async () => {
  if (selectedTask.value) {
    if (selectedTask.value.notes) {
      notesMarkdown.value = turndownService.turndown(selectedTask.value.notes);
    }

    await getThreadMessages();
  }
});

const sendMessage = async () => {
  if (newMessage.value.length > 0 && !loading.value) {
    console.log("sending message");
    const msgNew = newMessage.value;
    newMessage.value = "";
    loading.value = true;
    pendingMessage.value = msgNew;

    const res = await $fetch("/api/chatWithGpt", {
      method: "post",
      body: {
        msg: msgNew,
        notes: notesMarkdown.value,
        thread_id: selectedTask.value.chat_thread_id,
      },
    });
    console.log(res);

    pendingMessage.value = null;
    loading.value = false;
    messages.value.push(...res);
  }
};
</script>

<template>
  <div
    ref="scrollContainer"
    class="flex flex-col h-[calc(100vh-16px-57px-2px)] overflow-y-auto"
  >
    <div ref="resize" class="flex-1 flex flex-col justify-end text-sm p-4">
      <!-- {{ notesMarkdown }} -->
      <div v-for="message in messages" :key="message.id" class="flex flex-col">
        <div
          v-if="message.role === 'assistant'"
          class="text-xs mb-1 opacity-30 flex items-center"
        >
          <span class="i-heroicons-sparkles-16-solid mr-0.5"></span>
          GPT4o
        </div>
        <div
          class="flex pb-4"
          :class="[
            { 'justify-start': message.role === 'assistant' },
            { 'justify-end': message.role === 'user' },
          ]"
        >
          <span
            id="msg"
            class="py-2 rounded-lg"
            :class="[
              {
                'mr-6': message.role === 'assistant',
              },
              {
                'bg-zinc-900 text-white dark:text-black dark:bg-white ml-6 px-3':
                  message.role === 'user',
              },
            ]"
          >
            <!--<span>{{ message.content[0].text.value }}</span>-->
            <vue-markdown :source="message.content[0].text.value" />
          </span>
        </div>
      </div>
      <!-- Pending msg -->
      <div v-if="pendingMessage" class="flex pb- justify-end">
        <span
          class="py-2 px-3 rounded-lg bg-indigo-500 text-white dark:bg-indigo-800 ml-6"
        >
          <span>{{ pendingMessage }}</span>
        </span>
      </div>
      <!-- Loading indicator message -->
      <div>
        <div v-if="loading" class="flex">
          <div
            class="flex flex-shrink space-x-1 justify-start items-center bg-zinc-50 dark:bg-zinc-800 p-2 rounded-lg"
          >
            <span class="sr-only">Loading...</span>
            <div
              class="h-2 w-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"
            ></div>
            <div
              class="h-2 w-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"
            ></div>
            <div class="h-2 w-2 bg-zinc-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="sticky bottom-0 left-0 bg-white dark:bg-zinc-900 px-4 pt-2">
      <UInput
        v-model="newMessage"
        @keypress.enter="sendMessage"
        :disabled="loading"
        placeholder="Chat..."
        size="xl"
        icon="i-heroicons-paper-airplane"
        :trailing="true"
      />
      <div class="flex justify-center text-xs opacity-70 py-2">
        <div class="flex items-center">
          <UIcon
            name="i-heroicons-lock-closed-16-solid"
            class="text-green-800 dark:text-green-500"
          />
          <small
            >This chat is private and will not be used for ai model
            training.</small
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style>
#msg pre {
  background-color: #f4f4f5;
  padding: 1rem;
  margin: 1rem 0rem;
  border-radius: 6px;
}

#msg pre code {
  color: black;
  padding: 0 0;
}

#msg code {
  background-color: #f4f4f5;
  color: black;
  border-radius: 4px;
  padding: 0 0.5rem;
}

.dark #msg pre {
  background-color: #1a1a1a;
  padding: 1rem;
  margin: 1rem 0rem;
  border-radius: 6px;
}

.dark #msg pre code {
  color: white;
  padding: 0 0;
}

.dark #msg code {
  background-color: #1a1a1a;
  color: white;
  border-radius: 4px;
  padding: 0 0.5rem;
}
</style>
