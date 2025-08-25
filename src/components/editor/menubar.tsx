import { useCurrentEditor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  Quote,
  Minus,
  CornerDownLeft,
  Undo2,
  Redo2,
  Palette,
  Eraser,
  Link,
  Image,
  Music,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Menubar({ 
  onImageUpload,
  onAudioUpload 
}: { 
  onImageUpload?: (file: File) => Promise<string>;
  onAudioUpload?: (file: File) => Promise<string>;
}) {
  const { editor } = useCurrentEditor();
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);


  if (!editor) {
    return null;
  }

  const openLinkDialog = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setShowLinkDialog(true);
  };

  const handleSetLink = () => {
    if (linkUrl === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      // Save current selection
      const { from, to } = editor.state.selection;
      
      editor
        .chain()
        .focus()
        .setLink({ href: linkUrl })
        .setTextSelection(to)
        .unsetMark("link")
        .run();
    }
    setShowLinkDialog(false);
    setLinkUrl("");
  };

  const handleCancel = () => {
    setShowLinkDialog(false);
    setLinkUrl("");
  };

  const handleImageUpload = async (file: File) => {
    if (!onImageUpload) return;
    setIsUploading(true);
    try {
      const url = await onImageUpload(file);
      editor?.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };



  const handleAudioUpload = async (file: File) => {
    if (!onAudioUpload) return;
    setIsUploading(true);
    try {
      const url = await onAudioUpload(file);
      editor?.chain().focus().setAudio({ src: url, title: file.name }).run();
    } catch (error) {
      console.error('Audio upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <>
      <div className="flex flex-wrap gap-1 p-2 border-b mb-4">
      {/* 撤销/重做 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded hover:bg-gray-100"
        title="撤销"
      >
        <Undo2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded hover:bg-gray-100"
        title="重做"
      >
        <Redo2 className="w-4 h-4" />
      </button>
      
      {/* 分隔符 */}
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      {/* 文字格式 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("bold") ? "bg-gray-100" : ""
        }`}
        title="粗体"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("italic") ? "bg-gray-100" : ""
        }`}
        title="斜体"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("strike") ? "bg-gray-100" : ""
        }`}
        title="删除线"
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => {
          editor.chain().focus().unsetAllMarks().run();
          editor.chain().focus().clearNodes().run();
        }}
        className="p-2 rounded hover:bg-gray-100"
        title="清除格式"
      >
        <Eraser className="w-4 h-4" />
      </button>
      
      {/* 分隔符 */}
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      {/* 段落类型 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("paragraph") ? "bg-gray-100" : ""
        }`}
        title="段落"
      >
        <Type className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("heading", { level: 1 }) ? "bg-gray-100" : ""
        }`}
        title="标题 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("heading", { level: 2 }) ? "bg-gray-100" : ""
        }`}
        title="标题 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("heading", { level: 3 }) ? "bg-gray-100" : ""
        }`}
        title="标题 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>
      
      {/* 分隔符 */}
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      {/* 列表和引用 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("bulletList") ? "bg-gray-100" : ""
        }`}
        title="无序列表"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("orderedList") ? "bg-gray-100" : ""
        }`}
        title="有序列表"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("blockquote") ? "bg-gray-100" : ""
        }`}
        title="引用"
      >
        <Quote className="w-4 h-4" />
      </button>
      
      {/* 分隔符 */}
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      {/* 颜色和对齐 */}
      <div className="relative">
        <input
          type="color"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="w-8 h-8 rounded border-0 cursor-pointer"
          title="文字颜色"
          defaultValue="#000000"
        />
      </div>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive({ textAlign: 'left' }) ? "bg-gray-100" : ""
        }`}
        title="左对齐"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive({ textAlign: 'center' }) ? "bg-gray-100" : ""
        }`}
        title="居中对齐"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive({ textAlign: 'right' }) ? "bg-gray-100" : ""
        }`}
        title="右对齐"
      >
        <AlignRight className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive({ textAlign: 'justify' }) ? "bg-gray-100" : ""
        }`}
        title="两端对齐"
      >
        <AlignJustify className="w-4 h-4" />
      </button>
      
      {/* 分隔符 */}
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      {/* 链接 */}
      <button
        type="button"
        onClick={openLinkDialog}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive("link") ? "bg-gray-100" : ""
        }`}
        title="链接"
      >
        <Link className="w-4 h-4" />
      </button>
      
      {/* 分隔符 */}
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      {/* 媒体 */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
        }}
        className="hidden"
        id="image-upload"
      />
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleAudioUpload(file);
        }}
        className="hidden"
        id="audio-upload"
      />
      <label
        htmlFor="image-upload"
        className="p-2 rounded hover:bg-gray-100 cursor-pointer inline-flex items-center"
        title="上传图片"
      >
        <Image className="w-4 h-4" />
      </label>
      <label
        htmlFor="audio-upload"
        className="p-2 rounded hover:bg-gray-100 cursor-pointer inline-flex items-center"
        title="上传音频"
      >
        <Music className="w-4 h-4" />
      </label>
      
      {/* 分隔符 */}
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      {/* 其他 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-2 rounded hover:bg-gray-100"
        title="分隔线"
      >
        <Minus className="w-4 h-4" />
      </button>
    </div>

    <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Link</DialogTitle>
          <DialogDescription>
            Enter the URL of the link. Leave it empty to remove the existing link.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              URL
            </Label>
            <Input
              id="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="col-span-3"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSetLink();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <button onClick={handleCancel}>
            Cancel
          </button>
          <button onClick={handleSetLink}>
            Confirm
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>



  </>
  );
}
