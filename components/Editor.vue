<script setup>
import TurndownService from "turndown";

var turndownService = new TurndownService({ headingStyle: "atx" });

const notesHTML = useState("notesHTML", () => " ");
const notesMarkdown = useState("notesMarkdown", () => "");

const editor = useEditor({
  content: notesHTML.value,
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
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-56px)]">
    <div class="p-4 border-b border-zinc-700 border-dashed">
      <span>New task</span>
    </div>
    <div v-if="editor" class="border-b border-zinc-700 border-dashed p-3">
      <button
        @click="editor.chain().focus().toggleBold().run()"
        :disabled="!editor.can().chain().focus().toggleBold().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('bold') }"
      >
        bold
      </button>
      <button
        @click="editor.chain().focus().toggleItalic().run()"
        :disabled="!editor.can().chain().focus().toggleItalic().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('italic') }"
      >
        italic
      </button>
      <button
        @click="editor.chain().focus().toggleStrike().run()"
        :disabled="!editor.can().chain().focus().toggleStrike().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('strike') }"
      >
        strike
      </button>
      <button
        @click="editor.chain().focus().toggleCode().run()"
        :disabled="!editor.can().chain().focus().toggleCode().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('code') }"
      >
        code
      </button>
      <button
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
      </button>
      <button
        @click="editor.chain().focus().setParagraph().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('paragraph') }"
      >
        paragraph
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
      >
        h1
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
      >
        h2
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
      >
        h3
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }"
      >
        h4
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }"
      >
        h5
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }"
      >
        h6
      </button>
      <button
        @click="editor.chain().focus().toggleBulletList().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('bulletList') }"
      >
        bullet list
      </button>
      <button
        @click="editor.chain().focus().toggleOrderedList().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('orderedList') }"
      >
        ordered list
      </button>
      <button
        @click="editor.chain().focus().toggleCodeBlock().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('codeBlock') }"
      >
        code block
      </button>
      <button
        @click="editor.chain().focus().toggleBlockquote().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :class="{ 'is-active': editor.isActive('blockquote') }"
      >
        blockquote
      </button>
      <button
        @click="editor.chain().focus().setHorizontalRule().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
      >
        horizontal rule
      </button>
      <button
        @click="editor.chain().focus().setHardBreak().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
      >
        hard break
      </button>
      <button
        @click="editor.chain().focus().undo().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :disabled="!editor.can().chain().focus().undo().run()"
      >
        undo
      </button>
      <button
        @click="editor.chain().focus().redo().run()"
        class="m-1 bg-zinc-700 rounded p-1 text-xs"
        :disabled="!editor.can().chain().focus().redo().run()"
      >
        redo
      </button>
    </div>
    <div class="overflow-auto flex flex-1">
      <div class="flex-1">
        <TiptapEditorContent :editor="editor" class="h-full" />
      </div>
    </div>
  </div>
</template>
