import {
  EditorBubbleMenu,
  EditorCharacterCount,
  EditorFormatBold,
  EditorFormatCode,
  EditorFormatItalic,
  EditorFormatStrike,
  EditorProvider,
} from "../index";

const content = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Launch notes" }],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "Select this text to format it, or type / for commands." }],
    },
  ],
};

export default function Demo() {
  return (
    <EditorProvider
      className="min-h-48 w-full max-w-2xl overflow-y-auto rounded-lg border bg-background p-4"
      content={content}
      placeholder="Start typing…"
    >
      <EditorBubbleMenu>
        <EditorFormatBold hideName />
        <EditorFormatItalic hideName />
        <EditorFormatStrike hideName />
        <EditorFormatCode hideName />
      </EditorBubbleMenu>
      <EditorCharacterCount.Words>Words: </EditorCharacterCount.Words>
    </EditorProvider>
  );
}
