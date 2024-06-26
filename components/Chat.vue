<script setup>
import TurndownService from "turndown";
import {useResizeObserver} from "@vueuse/core";

var turndownService = new TurndownService({headingStyle: "atx"});

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
    const {data} = await useFetch(
        `/api/getThreadMessages?thread_id=${selectedTask.value.chat_thread_id}`
    );
//  console.log(data.value);

    messages.value = [welcomeMessage, ...data.value];
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
                // notes: notesMarkdown.value,
                notes: "", // TODO: find a smarter way of doing this
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
              class="py-2 px-3 rounded-lg"
              :class="[
              { 'bg-zinc-800 mr-6': message.role === 'assistant' },
              { 'bg-indigo-800 ml-6': message.role === 'user' },
            ]"
          >
            <span>{{ message.content[0].text.value }}</span>
          </span>
                </div>
            </div>
            <!-- Pending msg -->
            <div v-if="pendingMessage" class="flex pb- justify-end">
        <span class="py-2 px-3 rounded-lg bg-indigo-800 ml-6">
          <span>{{ pendingMessage }}</span>
        </span>
            </div>
            <!-- Loading indicator message -->
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
                :disabled="loading"
                placeholder="Chat..."
                size="xl"
                icon="i-heroicons-paper-airplane"
                :trailing="true"
            />
        </div>
    </div>
</template>
