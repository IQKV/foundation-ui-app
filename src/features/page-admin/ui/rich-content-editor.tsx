import { Box, Text, Input } from "@mantine/core";
import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Image } from "@tiptap/extension-image";
import { useEffect, useRef } from "react";
import { Trans, useLingui } from "@lingui/react/macro";

interface RichContentEditorProps {
  value: string | null | undefined;
  onChange: (html: string) => void;
  error?: string | null;
  required?: boolean;
  disabled?: boolean;
  label?: string;
}

export function RichContentEditor({
  value,
  onChange,
  error,
  required,
  disabled,
  label,
}: RichContentEditorProps) {
  const { t } = useLingui();
  const suppressOnUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Image,
    ],
    content: value ?? "",
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      if (!suppressOnUpdate.current) {
        onChange(ed.getHTML());
      }
    },
  });

  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const incoming = value ?? "";
    if (currentHtml !== incoming) {
      suppressOnUpdate.current = true;
      editor.commands.setContent(incoming, { emitUpdate: false });
      suppressOnUpdate.current = false;
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  return (
    <Box>
      {label && (
        <Input.Label required={required} mb={4} size="sm">
          {label}
        </Input.Label>
      )}

      <RichTextEditor
        editor={editor}
        style={{
          border: error
            ? "1px solid var(--mantine-color-red-6)"
            : "1px solid var(--mantine-color-gray-3)",
          borderRadius: "var(--mantine-radius-sm)",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <RichTextEditor.Toolbar sticky stickyOffset={60}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.ClearFormatting />
            <RichTextEditor.Code />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.H4 />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
            <RichTextEditor.Blockquote />
            <RichTextEditor.Hr />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.AlignLeft />
            <RichTextEditor.AlignCenter />
            <RichTextEditor.AlignRight />
            <RichTextEditor.AlignJustify />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content
          style={{ minHeight: 280, fontSize: "var(--mantine-font-size-sm)" }}
        />
      </RichTextEditor>

      {error && (
        <Text size="xs" c="red" mt={4}>
          {error}
        </Text>
      )}
      {!value && !error && (
        <Text size="xs" c="dimmed" mt={4}>
          <Trans>HTML content. At least one paragraph required for the default locale.</Trans>
        </Text>
      )}
    </Box>
  );
}
