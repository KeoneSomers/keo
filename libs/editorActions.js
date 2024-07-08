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
} from "@remixicon/vue";

export const actions = [
  {
    label: "Bold",
    icon: RiBold,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setMark("bold").run();
    },
  },
  {
    label: "Italic",
    icon: RiItalic,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setMark("italic").run();
    },
  },
  {
    label: "Strikethough",
    icon: RiStrikethrough,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setMark("strike").run();
    },
  },
  {
    label: "Code",
    icon: RiCodeLine,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setMark("code").run();
    },
  },
  {
    label: "Paragraph",
    icon: RiParagraph,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("paragraph").run();
    },
  },
  {
    label: "Bullet List",
    icon: RiListUnordered,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    label: "Numbered List",
    icon: RiListOrdered,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    label: "Code Block",
    icon: RiCodeBlock,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    label: "Quote",
    icon: RiQuoteText,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    label: "Horizontal Rule",
    icon: RiRulerLine,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    label: "Heading 1",
    icon: RiH1,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    label: "Heading 2",
    icon: RiH2,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    label: "Heading 3",
    icon: RiH3,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    label: "Heading 4",
    icon: RiH4,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 4 })
        .run();
    },
  },
  {
    label: "Heading 5",
    icon: RiH5,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 5 })
        .run();
    },
  },
  {
    label: "Heading 6",
    icon: RiH6,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 6 })
        .run();
    },
  },
];
