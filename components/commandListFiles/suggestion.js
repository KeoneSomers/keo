import {VueRenderer} from "@tiptap/vue-3";
import tippy from "tippy.js";

import CommandsList from "../CommandsList.vue";

export default {
    items: ({query}) => {
        return [
            {
                title: "Bold",
                command: ({editor, range}) => {
                    editor.chain().focus().deleteRange(range).setMark("bold").run();
                },
            },
            {
                title: "Italic",
                command: ({editor, range}) => {
                    editor.chain().focus().deleteRange(range).setMark("italic").run();
                },
            },
            {
                title: "Strikethough",
                command: ({editor, range}) => {
                    editor.chain().focus().deleteRange(range).setMark("strike").run();
                },
            },
            {
                title: "Code",
                command: ({editor, range}) => {
                    editor.chain().focus().deleteRange(range).setMark("code").run();
                },
            },
            {
                title: "Paragraph",
                command: ({editor, range}) => {
                    editor.chain().focus().deleteRange(range).setMark("paragraph").run();
                },
            },
            {
                title: "BulletList",
                command: ({editor, range}) => {
                    editor.chain().focus().deleteRange(range).toggleBulletList().run();
                },
            },
            {
                title: "NumberedList",
                command: ({editor, range}) => {
                    editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .toggleOrderedList()
                        .run();
                },
            },
            {
                title: "CodeBlock",
                command: ({editor, range}) => {
                    editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
                },
            },
            {
                title: "BlockQuote",
                command: ({editor, range}) => {
                    editor.chain().focus().deleteRange(range).toggleBlockquote().run();
                },
            },
            {
                title: "HR",
                command: ({editor, range}) => {
                    editor.chain().focus().deleteRange(range).setHorizontalRule().run();
                },
            },
            {
                title: "H1",
                command: ({editor, range}) => {
                    editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .setNode("heading", {level: 1})
                        .run();
                },
            },
            {
                title: "H2",
                command: ({editor, range}) => {
                    editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .setNode("heading", {level: 2})
                        .run();
                },
            },
            {
                title: "H3",
                command: ({editor, range}) => {
                    editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .setNode("heading", {level: 3})
                        .run();
                },
            },
            {
                title: "H4",
                command: ({editor, range}) => {
                    editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .setNode("heading", {level: 4})
                        .run();
                },
            },
            {
                title: "H5",
                command: ({editor, range}) => {
                    editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .setNode("heading", {level: 5})
                        .run();
                },
            },
            {
                title: "H6",
                command: ({editor, range}) => {
                    editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .setNode("heading", {level: 6})
                        .run();
                },
            },
        ]
            .filter((item) =>
                item.title.toLowerCase().startsWith(query.toLowerCase())
            )
            .slice(0, 100);
    },

    render: () => {
        let component;
        let popup;

        return {
            onStart: (props) => {
                component = new VueRenderer(CommandsList, {
                    // using vue 2:
                    // parent: this,
                    // propsData: props,
                    props,
                    editor: props.editor,
                });

                if (!props.clientRect) {
                    return;
                }

                popup = tippy("body", {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: "manual",
                    placement: "bottom-start",
                });
            },

            onUpdate(props) {
                component.updateProps(props);

                if (!props.clientRect) {
                    return;
                }

                popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                });
            },

            onKeyDown(props) {
                if (props.event.key === "Escape") {
                    popup[0].hide();

                    return true;
                }

                return component.ref?.onKeyDown(props);
            },

            onExit() {
                popup[0].destroy();
                component.destroy();
            },
        };
    },
};
