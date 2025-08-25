"use client";

import "@/components/editor/style.css";

import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import { TextStyle } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { EditorProvider, useCurrentEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";
import Menubar from "./menubar";
import Audio from "./extensions/Audio";

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Link.configure({
    openOnClick: false,
  }),
  Image.configure({
    HTMLAttributes: {
      class: 'editor-image',
    },
  }),
  Audio.configure({
    HTMLAttributes: {
      class: 'editor-audio',
    },
  }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
    // 禁用编程相关功能
    code: false,
    codeBlock: false,
  }),
];

export default function Editor({
  value,
  onChange,
  onImageUpload,
  onAudioUpload,
}: {
  value: string;
  onChange: (value: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  onAudioUpload?: (file: File) => Promise<string>;
}) {
  return (
    <div className="border rounded-md bg-background">
      <EditorProvider
        slotBefore={<Menubar onImageUpload={onImageUpload} onAudioUpload={onAudioUpload} />}
        extensions={extensions}
        content={value}
        immediatelyRender={false}
        onUpdate={({ editor }) => {
          onChange(editor.getHTML());
        }}
      ></EditorProvider>
    </div>
  );
}
