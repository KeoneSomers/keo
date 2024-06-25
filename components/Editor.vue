<script setup>
import Placeholder from "@tiptap/extension-placeholder";
import Commands from "./commandListFiles/commands.js";
import suggestion from "./commandListFiles/suggestion.js";
import { useDebounceFn } from "@vueuse/core";
import { BubbleMenu, Editor, EditorContent, FloatingMenu } from "@tiptap/vue-3";
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

const supabase = useSupabaseClient();
const selectedTask = useState("selectedTask");

const notesMarkdown = useState("notesMarkdown", () => "");

const editor = useEditor({
  content: selectedTask.value.notes ? selectedTask.value.notes : "",
  autofocus: true,
  extensions: [
    TiptapStarterKit,
    Commands.configure({
      suggestion,
    }),
    Placeholder.configure({
      // Use a placeholder:
      placeholder: "Write something, or press '/' for commands…",
      // Use different placeholders depending on the node type:
      // placeholder: ({ node }) => {
      //   if (node.type.name === 'heading') {
      //     return 'What’s the title?'
      //   }

      //   return 'Can you add some further context?'
      // },
    }),
  ],
  editorProps: {
    attributes: {
      class:
        "prose prose-base prose-zinc dark:prose-invert m-5 focus:outline-none h-full",
    },
  },
  onUpdate: ({ editor }) => {
    selectedTask.value.notes = editor.getHTML();
    notesMarkdown.value = turndownService.turndown(editor.getHTML());

    // call debounced save function
    debouncedFnSaveNotes();
  },
});

onBeforeUnmount(() => {
  unref(editor).destroy();
});

watch(selectedTask, async (newState, oldState) => {
  console.log("task changed");

  if (newState.notes) {
    editor.value.commands.setContent(selectedTask.value.notes);
  } else {
    editor.value.commands.setContent("");
  }
});

const debouncedFnSaveNotes = useDebounceFn(() => {
  saveNotes();
}, 2000);

const saveNotes = async () => {
  console.log("Saving notes");
  const { error } = await supabase
    .from("tasks")
    .update({ notes: selectedTask.value.notes })
    .eq("id", selectedTask.value.id);

  if (error) {
    console.log(error);
    return;
  }
};
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-16px-57px-2px)] overflow-auto">
    <!-- <div v-if="editor" class="bg-zinc-950/30 m-2 rounded p-1 sticky top-0"> -->
    <!-- <button
        @click="editor.chain().focus().toggleBold().run()"
        :disabled="!editor.can().chain().focus().toggleBold().run()"
        class="m-1 bg-zinc-800 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('bold') }"
      >
        <RiBold size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleItalic().run()"
        :disabled="!editor.can().chain().focus().toggleItalic().run()"
        class="m-1 bg-zinc-800 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('italic') }"
      >
        <RiItalic size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleStrike().run()"
        :disabled="!editor.can().chain().focus().toggleStrike().run()"
        class="m-1 bg-zinc-800 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('strike') }"
      >
        <RiStrikethrough size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleCode().run()"
        :disabled="!editor.can().chain().focus().toggleCode().run()"
        class="m-1 bg-zinc-800 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('code') }"
      >
        <RiCodeLine size="16px" />
      </button>
      <button
        @click="editor.chain().focus().unsetAllMarks().run()"
        class="m-1 bg-zinc-800 rounded p-1 text-xs"
      >
        clear marks
      </button>
      <button
        @click="editor.chain().focus().clearNodes().run()"
        class="m-1 bg-zinc-800 rounded p-1 text-xs"
      >
        clear nodes
      </button>
      <button
        @click="editor.chain().focus().setParagraph().run()"
        class="m-1 bg-zinc-800 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('paragraph') }"
      >
        <RiParagraph size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        class="m-1 bg-zinc-800 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
      >
        <RiH1 size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        class="m-1 bg-zinc-800 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
      >
        <RiH2 size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        class="m-1 bg-zinc-800 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
      >
        <RiH3 size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
        class="m-1 bg-zinc-800 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }"
      >
        <RiH4 size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
        class="m-1 bg-zinc-800 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }"
      >
        <RiH5 size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
        class="m-1 bg-zinc-800 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }"
      >
        <RiH6 size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleBulletList().run()"
        class="m-1 bg-zinc-800 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('bulletList') }"
      >
        <RiListUnordered size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleOrderedList().run()"
        class="m-1 bg-zinc-800 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('orderedList') }"
      >
        <RiListOrdered size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleCodeBlock().run()"
        class="m-1 bg-zinc-800 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('codeBlock') }"
      >
        <RiCodeBlock size="16px" />
      </button>
      <button
        @click="editor.chain().focus().toggleBlockquote().run()"
        class="m-1 bg-zinc-800 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('blockquote') }"
      >
        <RiQuoteText size="16px" />
      </button>
      <button
        @click="editor.chain().focus().setHorizontalRule().run()"
        class="m-1 bg-zinc-800 rounded p-1 text-xs"
      >
        <RiRulerLine size="16px" />
      </button>
      <button
        @click="editor.chain().focus().setHardBreak().run()"
        class="m-1 bg-zinc-800 rounded p-1 text-xs"
      >
        <RiSpace size="16px" />
      </button> -->
    <!-- <button
        @click="editor.chain().focus().undo().run()"
        class="m-1 bg-zinc-800 rounded p-1 text-xs"
        :class="{ 'opacity-50': !editor.can().chain().focus().undo().run() }"
        :disabled="!editor.can().chain().focus().undo().run()"
      >
        <RiArrowGoBackLine size="16px" />
      </button>
      <button
        @click="editor.chain().focus().redo().run()"
        class="m-1 bg-zinc-800 rounded p-1 text-xs"
        :class="{ 'opacity-50': !editor.can().chain().focus().redo().run() }"
        :disabled="!editor.can().chain().focus().redo().run()"
      >
        <RiArrowGoForwardLine size="16px" />
      </button> -->
    <!-- </div> -->
    <div class="flex flex-1">
      <div class="flex-1">
        <div v-if="editor">
          <bubble-menu
            class="bubble-menu"
            :tippy-options="{ duration: 100 }"
            :editor="editor"
          >
            <button
              @click="editor.chain().focus().toggleBold().run()"
              :class="{ 'is-active': editor.isActive('bold') }"
            >
              Bold
            </button>
            <button
              @click="editor.chain().focus().toggleItalic().run()"
              :class="{ 'is-active': editor.isActive('italic') }"
            >
              Italic
            </button>
            <button
              @click="editor.chain().focus().toggleStrike().run()"
              :class="{ 'is-active': editor.isActive('strike') }"
            >
              Strike
            </button>
          </bubble-menu>

          <floating-menu
            class="floating-menu"
            :tippy-options="{ duration: 100 }"
            :editor="editor"
          >
            <button
              @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
              :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
            >
              H1
            </button>
            <button
              @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
              :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
            >
              H2
            </button>
            <button
              @click="editor.chain().focus().toggleBulletList().run()"
              :class="{ 'is-active': editor.isActive('bulletList') }"
            >
              Bullet list
            </button>
          </floating-menu>
        </div>
        <TiptapEditorContent :editor="editor" class="h-full" />
      </div>
    </div>
  </div>
</template>

<style>
/* Placeholder (at the top) */
p.is-editor-empty:first-child::before {
  color: grey;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* Placeholder (on every new line) */
.is-empty::before {
  color: grey;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* Bubble menu */
.bubble-menu {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 0.7rem;
  display: flex;
  padding: 0.2rem;

  button {
    background-color: unset;
    padding: 0.05rem 0.5rem;

    &:hover {
      background-color: #454545;
    }

    &.is-active {
      background-color: #4b0082;

      &:hover {
        background-color: #8031b9;
      }
    }
  }
}
</style>
