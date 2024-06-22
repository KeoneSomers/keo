<script setup>
import { watchDebounced } from "@vueuse/core";
import TurndownService from "turndown";
import {
  RiBold,
  RiItalic,
  RiStrikethrough,
  RiCodeLine,
  RiParagraph,
  RiH1,
  RiH2,
  RiH3,
  RiH4,
  RiH5,
  RiH6,
  RiListUnordered,
  RiListOrdered,
  RiCodeBlock,
  RiQuoteText,
  RiRulerLine,
  RiSpace,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
} from "@remixicon/vue";

var turndownService = new TurndownService({ headingStyle: "atx" });

const notesHTML = useState("notesHTML", () => " ");
const notesMarkdown = useState("notesMarkdown", () => "");

const editor = useEditor({
  content: notesHTML.value,
  autofocus: true,
  extensions: [TiptapStarterKit],
  editorProps: {
    attributes: {
      class:
        "prose prose-base prose-zinc dark:prose-invert m-5 focus:outline-none h-full",
    },
  },
  onUpdate: ({ editor }) => {
    notesHTML.value = editor.getHTML();
    notesMarkdown.value = turndownService.turndown(editor.getHTML().toString());
  },
});

onBeforeUnmount(() => {
  unref(editor).destroy();
});

const supabase = useSupabaseClient();
const tasks = useState("tasks", () => []);
const selectedTask = useState("selectedTask");

const title = ref("");

watchEffect(async () => {
  title.value = selectedTask.value.title;
});

// debounced saving
watchDebounced(
  title,
  () => {
    saveTitle();
  },
  { debounce: 1000, maxWait: 5000 }
);

const saveTitle = async () => {
  console.log("Saving changes");
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
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-56px)]">
    <div class="border-b border-zinc-700 border-dashed">
      <UInput
        v-model="title"
        placeholder="Give this task a name..."
        size="xl"
        variant="none"
        class="p-1.5"
      />
    </div>
    <div v-if="editor" class="bg-zinc-800 m-2 rounded p-1">
      <button
        @click="editor.chain().focus().toggleBold().run()"
        :disabled="!editor.can().chain().focus().toggleBold().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('bold') }"
      >
        <RiBold size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleItalic().run()"
        :disabled="!editor.can().chain().focus().toggleItalic().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('italic') }"
      >
        <RiItalic size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleStrike().run()"
        :disabled="!editor.can().chain().focus().toggleStrike().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('strike') }"
      >
        <RiStrikethrough size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleCode().run()"
        :disabled="!editor.can().chain().focus().toggleCode().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('code') }"
      >
        <RiCodeLine size="16px" />
      </button>
      <!-- <button
        @click="editor.chain().focus().unsetAllMarks().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
      >
        clear marks
      </button>
      <button
        @click="editor.chain().focus().clearNodes().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
      >
        clear nodes
      </button> -->
      <button
        @click="editor.chain().focus().setParagraph().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('paragraph') }"
      >
        <RiParagraph size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
      >
        <RiH1 size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
      >
        <RiH2 size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
      >
        <RiH3 size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }"
      >
        <RiH4 size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }"
      >
        <RiH5 size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }"
      >
        <RiH6 size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleBulletList().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('bulletList') }"
      >
        <RiListUnordered size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleOrderedList().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('orderedList') }"
      >
        <RiListOrdered size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleCodeBlock().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('codeBlock') }"
      >
        <RiCodeBlock size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleBlockquote().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('blockquote') }"
      >
        <RiQuoteText size="16px" />
      </button>
      <button
        @click="editor.chain().focus().setHorizontalRule().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
      >
        <RiRulerLine size="16px" />
      </button>
      <button
        @click="editor.chain().focus().setHardBreak().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
      >
        <RiSpace size="16px" />
      </button>
      <button
        @click="editor.chain().focus().undo().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'opacity-50': !editor.can().chain().focus().undo().run() }"
        :disabled="!editor.can().chain().focus().undo().run()"
      >
        <RiArrowGoBackLine size="16px" />
      </button>
      <button
        @click="editor.chain().focus().redo().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'opacity-50': !editor.can().chain().focus().redo().run() }"
        :disabled="!editor.can().chain().focus().redo().run()"
      >
        <RiArrowGoForwardLine size="16px" />
      </button>
    </div>
    <div class="overflow-auto flex flex-1">
      <div class="flex-1">
        <TiptapEditorContent :editor="editor" class="h-full" />
      </div>
    </div>
  </div>
</template>
