<script setup>
import {useThrottleFn} from "@vueuse/core";

const searchQuery = ref("");

const supabase = useSupabaseClient();
const user = useSupabaseUser();


const tasks = useState("tasks", () => []);
const selectedTask = useState("selectedTask", () => null);

const signOut = async () => {
    const {error} = await supabase.auth.signOut();
    if (error) {
        console.log(error);
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
    const {data, error} = await supabase
        .from("tasks")
        .select("id, title, completed_at")
        .eq("created_by", user.value.id)
        .order("id", {ascending: false});

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
    const {data: thread} = await useFetch("/api/openai/threads/create");
    console.log(thread.value.id);

    if (!thread.value) {
        console.log("No thread was created and returned.");
        return;
    }

    // Create task in superbase
    const {data: newTask, error} = await supabase
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

const handleSelectTask = async (taskId) => {
    if (selectedTask.value && taskId === selectedTask.value.id) {
        return;
    }

    await selectTask(taskId);
};

const selectTask = async (taskId) => {
    const {data, error} = await supabase
        .from("tasks")
        .select()
        .single()
        .eq("id", taskId);

//    console.log(data);

    if (error) {
        console.log(error);
        return;
    }

    selectedTask.value = data;
};
</script>

<template>
    <div class="overflow-y-auto h-screen flex flex-col">
        <div class="px-4 py-4 flex items-center space-x-1">
        <img src="/logo.png" class="h-3 w-3 dark:invert">
            <span class="font-mono font-extrabold">keo</span>
        </div>

        <div class="p-4">
            <UButton @click="throttledFnCreateNewTask" block color="black"
            >New Task
            </UButton
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
                @click="handleSelectTask(task.id)"
                class="p-2 mx-4 my-1 select-none text-sm rounded-lg border-zinc-700 border-dashed hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer truncate"
                :class="[
            {
              'bg-zinc-100 dark:bg-zinc-900':
                selectedTask !== null && task.id === selectedTask.id,
            },
            {
              'opacity-50':
                selectedTask === null ||
                (task.id !== selectedTask.id),
            },
            { 'line-through': task.completed_at !== null },
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
                class="bg-gradient-to-r from-indigo-200 to-yellow-100 dark:bg-gradient-to-r dark:from-blue-800 dark:to-indigo-900 rounded-lg mb-2 p-4 cursor-pointer dark:hover:bg-indigo-900/75 hover:bg-indigo-400/75"
            >
                <p class="text-sm">Upgrade to Keo Plus!</p>
                <p class="opacity-50 text-xs">Coming soon...</p>
            </div>
            <div class="flex space-x-1">
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
                <ThemeToggle/>
            </div>

        </div>
    </div>
</template>