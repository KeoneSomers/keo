<script setup>
const notesMarkdown = useState("notesMarkdown", () => "");
const selectedTask = useState("selectedTask");
const welcomeMessage = {
  id: "0",
  content: [
    {
      text: {
        value: "Hey there!",
      },
    },
  ],
  role: "assistant",
};
const messages = ref([]);
const newMessage = ref("");
const loading = ref(false);

const getThreadMessages = async () => {
  const { data } = await useFetch(
    `/api/getThreadMessages?thread_id=${selectedTask.value.chat_thread_id}`
  );
  console.log(data.value);

  messages.value = [welcomeMessage, ...data.value];
};

watchEffect(async () => {
  if (selectedTask.value) {
    await getThreadMessages();
  }
});

const sendMessage = async () => {
  if (newMessage.value.length > 0) {
    console.log("sending message");
    const msgNew = newMessage.value;
    newMessage.value = "";
    loading.value = true;

    const res = await $fetch("/api/chatWithGpt", {
      method: "post",
      body: {
        msg: msgNew,
        thread_id: selectedTask.value.chat_thread_id,
      },
    });
    console.log(res);

    loading.value = false;
    messages.value.push(...res);
  }
};
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-56px)] overflow-y-auto">
    <div class="flex-1 flex flex-col justify-end text-sm p-4">
      {{ notesMarkdown }}
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex pb-4"
        :class="[
          { 'justify-start': message.role === 'assistant' },
          { 'justify-end': message.role === 'user' },
        ]"
      >
        <span
          class="py-2 px-3 rounded-lg"
          :class="[
            { 'bg-zinc-800 mr-6': message.role === 'assistant' },
            { 'bg-indigo-800 ml-6': message.role === 'user' },
          ]"
        >
          <span>{{ message.content[0].text.value }}</span>
        </span>
      </div>
      <div>
        <div v-if="loading" class="flex">
          <div
            class="flex flex-shrink space-x-1 justify-start items-center bg-zinc-800 p-2 rounded-lg"
          >
            <span class="sr-only">Loading...</span>
            <div
              class="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"
            ></div>
            <div
              class="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"
            ></div>
            <div class="h-2 w-2 bg-white rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="sticky bottom-0 left-0 bg-zinc-900 p-4">
      <UInput
        v-model="newMessage"
        @keypress.enter="sendMessage"
        placeholder="Chat..."
        size="xl"
        icon="i-heroicons-paper-airplane"
        :trailing="true"
      />
    </div>
  </div>
</template>
