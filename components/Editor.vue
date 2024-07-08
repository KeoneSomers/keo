<script setup>
import Placeholder from "@tiptap/extension-placeholder";
import Code from "@tiptap/extension-code";
import Commands from "./commandListFiles/commands.js";
import suggestion from "./commandListFiles/suggestion.js";
import { useDebounceFn } from "@vueuse/core";
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
} from "@remixicon/vue";

const turndownService = new TurndownService({ headingStyle: "atx" });

const supabase = useSupabaseClient();
const selectedTask = useState("selectedTask");

const notesMarkdown = useState("notesMarkdown", () => "");

const editor = useEditor({
  content: selectedTask.value.notes ? selectedTask.value.notes : "",
  autofocus: true,
  extensions: [
    TiptapStarterKit,
    Code,
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
  const e = unref(editor);
  if (e !== undefined) {
    e.destroy();
  }
});

watch(selectedTask, async (newState, oldState) => {
  console.log("task changed");

  if (editor.value) {
    if (newState.notes) {
      editor.value.commands.setContent(selectedTask.value.notes);
    } else {
      editor.value.commands.setContent("");
    }
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
  }
};

const toolbarActions = computed(() => {
  if (editor.value) {
    return [
      {
        id: 0,
        label: "Bold",
        icon: RiBold,
        clickAction: () => editor.value.chain().focus().toggleBold().run(),
        isDisabled: !editor.value.can().chain().focus().toggleBold().run(),
        isActive: editor.value.isActive("bold"),
      },
      {
        id: 1,
        label: "Italic",
        icon: RiItalic,
        clickAction: () => editor.value.chain().focus().toggleItalic().run(),
        isDisabled: !editor.value.can().chain().focus().toggleItalic().run(),
        isActive: editor.value.isActive("italic"),
      },
      {
        id: 2,
        label: "Strike Through",
        icon: RiStrikethrough,
        clickAction: () => editor.value.chain().focus().toggleStrike().run(),
        isDisabled: !editor.value.can().chain().focus().toggleStrike().run(),
        isActive: editor.value.isActive("strike"),
      },
      {
        id: 3,
        label: "Code (Inline)",
        icon: RiCodeLine,
        clickAction: () => editor.value.chain().focus().toggleCode().run(),
        isDisabled: !editor.value.can().chain().focus().toggleCode().run(),
        isActive: editor.value.isActive("code"),
      },
      {
        id: 4,
        label: "Paragraph",
        icon: RiParagraph,
        clickAction: () => editor.value.chain().focus().setParagraph().run(),
        isDisabled: false,
        isActive: editor.value.isActive("paragraph"),
      },
      {
        id: 5,
        label: "Heading 1",
        icon: RiH1,
        clickAction: () =>
          editor.value.chain().focus().toggleHeading({ level: 1 }).run(),
        isDisabled: false,
        isActive: editor.value.isActive("heading", { level: 1 }),
      },
      {
        id: 6,
        label: "Heading 2",
        icon: RiH2,
        clickAction: () =>
          editor.value.chain().focus().toggleHeading({ level: 2 }).run(),
        isDisabled: false,
        isActive: editor.value.isActive("heading", { level: 2 }),
      },
      {
        id: 7,
        label: "Heading 3",
        icon: RiH3,
        clickAction: () =>
          editor.value.chain().focus().toggleHeading({ level: 3 }).run(),
        isDisabled: false,
        isActive: editor.value.isActive("heading", { level: 3 }),
      },
      {
        id: 8,
        label: "Heading 4",
        icon: RiH4,
        clickAction: () =>
          editor.value.chain().focus().toggleHeading({ level: 4 }).run(),
        isDisabled: false,
        isActive: editor.value.isActive("heading", { level: 4 }),
      },
      {
        id: 9,
        label: "Heading 5",
        icon: RiH5,
        clickAction: () =>
          editor.value.chain().focus().toggleHeading({ level: 5 }).run(),
        isDisabled: false,
        isActive: editor.value.isActive("heading", { level: 5 }),
      },
      {
        id: 10,
        label: "Heading 6",
        icon: RiH6,
        clickAction: () =>
          editor.value.chain().focus().toggleHeading({ level: 6 }).run(),
        isDisabled: false,
        isActive: editor.value.isActive("heading", { level: 6 }),
      },
      {
        id: 11,
        label: "Bullet List",
        icon: RiListUnordered,
        clickAction: () =>
          editor.value.chain().focus().toggleBulletList().run(),
        isDisabled: false,
        isActive: editor.value.isActive("bulletList"),
      },
      {
        id: 12,
        label: "Numbered List",
        icon: RiListOrdered,
        clickAction: () =>
          editor.value.chain().focus().toggleOrderedList().run(),
        isDisabled: false,
        isActive: editor.value.isActive("orderedList"),
      },
      {
        id: 13,
        label: "Code (Block)",
        icon: RiCodeBlock,
        clickAction: () => editor.value.chain().focus().toggleCodeBlock().run(),
        isDisabled: false,
        isActive: editor.value.isActive("codeBlock"),
      },
      {
        id: 14,
        label: "Quote Text",
        icon: RiQuoteText,
        clickAction: () =>
          editor.value.chain().focus().toggleBlockquote().run(),
        isDisabled: false,
        isActive: editor.value.isActive("blockquote"),
      },
      {
        id: 15,
        label: "Horizontal Rule",
        icon: RiRulerLine,
        clickAction: () =>
          editor.value.chain().focus().setHorizontalRule().run(),
        isDisabled: false,
        isActive: false,
      },
      {
        id: 16,
        label: "Line Break",
        icon: RiSpace,
        clickAction: () => editor.value.chain().focus().setHardBreak().run(),
        isDisabled: false,
        isActive: false,
      },
    ];
  } else {
    return [];
  }
});
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-16px-57px-2px)] overflow-auto">
    <div
      v-if="editor"
      class="bg-zinc-100 dark:bg-zinc-950 m-4 mb-0 rounded p-1 sticky top-0"
    >
      <UTooltip
        v-for="action in toolbarActions"
        :key="action.id"
        :text="action.label"
      >
        <button
          @click="action.clickAction()"
          :disabled="action.isDisabled"
          class="m-1 rounded p-1 text-xs"
          :class="[
            {
              'bg-zinc-900 hover:bg-zinc-700 text-white dark:bg-zinc-50 hover:dark:bg-zinc-300 dark:text-zinc-900':
                action.isActive,
            },
            {
              'hover:bg-zinc-200 dark:bg-zinc-950 hover:dark:bg-zinc-800':
                !action.isActive,
            },
          ]"
        >
          <component :is="action.icon" size="16px" />
        </button>
      </UTooltip>
    </div>
    <div class="flex flex-1">
      <div class="flex-1">
        <TiptapEditorContent :editor="editor" class="h-full" />
      </div>
    </div>
  </div>
</template>

<style>
/* remove '' from inline code blocks */
.prose :where(code):not(:where([class~="not-prose"] *))::before {
  content: "";
}
.prose :where(code):not(:where([class~="not-prose"] *))::after {
  content: "";
}

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

/* Code and preformatted text styles */
.light pre {
  background-color: #f4f4f5;
  color: black;
  font-weight: bold;
}

.dark pre {
  background-color: #3a3a3a;
  color: white;
  font-weight: bold;
}

.light .tiptap :not(pre) code {
  background-color: #f4f4f5;
  border-radius: 0.4rem;
  color: black;
  font-size: 0.75rem;
  padding: 0.2rem 0.2rem;
}

.dark .tiptap :not(pre) code {
  background-color: #3a3a3a;
  border-radius: 0.4rem;
  color: white;
  font-size: 0.75rem;
  padding: 0.2rem 0.2rem;
}
</style>
