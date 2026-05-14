import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Link as LinkIcon,
  Code2,
  Undo2,
  Redo2,
  Eraser,
} from "lucide-react";

const exec = (cmd, value = null) => {
  // execCommand is deprecated but still the simplest cross-browser path for
  // a lightweight contenteditable editor.
  document.execCommand(cmd, false, value);
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const compressImage = (dataUrl, maxWidth = 1200, quality = 0.85) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      try {
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });

const insertHtmlAtCursor = (html) => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) {
    document.execCommand("insertHTML", false, html);
    return;
  }
  const range = sel.getRangeAt(0);
  range.deleteContents();
  const el = document.createElement("div");
  el.innerHTML = html;
  const frag = document.createDocumentFragment();
  let node;
  let last;
  while ((node = el.firstChild)) {
    last = frag.appendChild(node);
  }
  range.insertNode(frag);
  if (last) {
    const newRange = range.cloneRange();
    newRange.setStartAfter(last);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }
};

export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [savedRange, setSavedRange] = useState(null);
  const lastValueRef = useRef("");

  // Initialise / sync external value into the editor without clobbering caret on every keystroke
  useEffect(() => {
    if (!editorRef.current) return;
    const next = value || "";
    if (next !== lastValueRef.current && next !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = next;
      lastValueRef.current = next;
    }
  }, [value]);

  const emitChange = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    lastValueRef.current = html;
    onChange?.(html);
  };

  const saveRange = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setSavedRange(sel.getRangeAt(0).cloneRange());
    }
  };

  const restoreRange = () => {
    if (!savedRange) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange);
  };

  const handleCommand = (cmd, val = null) => {
    editorRef.current?.focus();
    exec(cmd, val);
    emitChange();
  };

  const handleBlock = (tag) => {
    editorRef.current?.focus();
    exec("formatBlock", tag);
    emitChange();
  };

  const insertImageFromFile = async (file) => {
    if (!file || !file.type?.startsWith("image/")) return;
    const dataUrl = await fileToDataUrl(file);
    const compressed = await compressImage(dataUrl);
    editorRef.current?.focus();
    restoreRange();
    insertHtmlAtCursor(
      `<p><img src="${compressed}" alt="" style="max-width:100%;height:auto;border-radius:8px;" /></p><p><br/></p>`,
    );
    emitChange();
  };

  const handleFileChoose = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const f of files) await insertImageFromFile(f);
    e.target.value = "";
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    // Place caret where the user dropped (best-effort)
    const range =
      document.caretRangeFromPoint?.(e.clientX, e.clientY) ||
      (document.caretPositionFromPoint
        ? (() => {
            const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
            if (!pos) return null;
            const r = document.createRange();
            r.setStart(pos.offsetNode, pos.offset);
            r.collapse(true);
            return r;
          })()
        : null);

    if (range) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }

    const files = Array.from(e.dataTransfer?.files || []).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (files.length > 0) {
      for (const f of files) await insertImageFromFile(f);
      return;
    }

    // Allow drag/drop of plain text/html too
    const html = e.dataTransfer?.getData("text/html");
    const text = e.dataTransfer?.getData("text/plain");
    if (html) insertHtmlAtCursor(html);
    else if (text) insertHtmlAtCursor(text.replace(/\n/g, "<br/>"));
    emitChange();
  };

  const handlePaste = async (e) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imageItem = items.find((i) => i.type.startsWith("image/"));
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) await insertImageFromFile(file);
      return;
    }
    // Let the browser paste text/html but normalise afterwards
    setTimeout(emitChange, 0);
  };

  const onCreateLink = () => {
    const url = prompt("Enter URL");
    if (!url) return;
    handleCommand("createLink", url);
  };

  return (
    <div className="border rounded-xl bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b bg-gray-50 px-2 py-2">
        <ToolbarBtn title="Undo" onClick={() => handleCommand("undo")}>
          <Undo2 size={16} />
        </ToolbarBtn>
        <ToolbarBtn title="Redo" onClick={() => handleCommand("redo")}>
          <Redo2 size={16} />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn title="Heading 1" onClick={() => handleBlock("h1")}>
          <Heading1 size={16} />
        </ToolbarBtn>
        <ToolbarBtn title="Heading 2" onClick={() => handleBlock("h2")}>
          <Heading2 size={16} />
        </ToolbarBtn>
        <ToolbarBtn title="Heading 3" onClick={() => handleBlock("h3")}>
          <Heading3 size={16} />
        </ToolbarBtn>
        <ToolbarBtn title="Paragraph" onClick={() => handleBlock("p")}>
          <span className="text-xs font-semibold">P</span>
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn title="Bold" onClick={() => handleCommand("bold")}>
          <Bold size={16} />
        </ToolbarBtn>
        <ToolbarBtn title="Italic" onClick={() => handleCommand("italic")}>
          <Italic size={16} />
        </ToolbarBtn>
        <ToolbarBtn title="Underline" onClick={() => handleCommand("underline")}>
          <Underline size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Strikethrough"
          onClick={() => handleCommand("strikeThrough")}
        >
          <Strikethrough size={16} />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          title="Bullet list"
          onClick={() => handleCommand("insertUnorderedList")}
        >
          <List size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Numbered list"
          onClick={() => handleCommand("insertOrderedList")}
        >
          <ListOrdered size={16} />
        </ToolbarBtn>
        <ToolbarBtn title="Quote" onClick={() => handleBlock("blockquote")}>
          <Quote size={16} />
        </ToolbarBtn>
        <ToolbarBtn title="Code block" onClick={() => handleBlock("pre")}>
          <Code2 size={16} />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          title="Align left"
          onClick={() => handleCommand("justifyLeft")}
        >
          <AlignLeft size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Align center"
          onClick={() => handleCommand("justifyCenter")}
        >
          <AlignCenter size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Align right"
          onClick={() => handleCommand("justifyRight")}
        >
          <AlignRight size={16} />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn title="Insert link" onClick={onCreateLink}>
          <LinkIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Insert image"
          onClick={() => {
            saveRange();
            fileInputRef.current?.click();
          }}
        >
          <ImageIcon size={16} />
        </ToolbarBtn>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChoose}
        />

        <Divider />

        <ToolbarBtn
          title="Clear formatting"
          onClick={() => handleCommand("removeFormat")}
        >
          <Eraser size={16} />
        </ToolbarBtn>
      </div>

      {/* Editor surface */}
      <div
        className={`relative ${isDragging ? "ring-2 ring-orange-400" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-orange-50/70">
            <div className="text-orange-700 text-sm font-medium">
              Drop image to insert at cursor
            </div>
          </div>
        )}
        <div
          ref={editorRef}
          className="cms-editor p-4 min-h-[400px] focus:outline-none prose prose-sm max-w-none"
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onKeyUp={saveRange}
          onMouseUp={saveRange}
          onBlur={saveRange}
          onPaste={handlePaste}
        />
      </div>

      <style>{`
        .cms-editor h1 { font-size: 1.6rem; font-weight: 700; margin: 0.6rem 0; }
        .cms-editor h2 { font-size: 1.3rem; font-weight: 700; margin: 0.6rem 0; }
        .cms-editor h3 { font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0; }
        .cms-editor p  { margin: 0.4rem 0; line-height: 1.6; }
        .cms-editor ul { list-style: disc; padding-left: 1.5rem; margin: 0.4rem 0; }
        .cms-editor ol { list-style: decimal; padding-left: 1.5rem; margin: 0.4rem 0; }
        .cms-editor blockquote { border-left: 3px solid #f59e0b; padding-left: 0.75rem; color: #555; margin: 0.5rem 0; }
        .cms-editor pre { background: #f3f4f6; padding: 0.75rem; border-radius: 8px; overflow-x: auto; font-family: monospace; }
        .cms-editor a  { color: #ea580c; text-decoration: underline; }
        .cms-editor img { max-width: 100%; height: auto; border-radius: 8px; }
        .cms-editor:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}

function ToolbarBtn({ children, title, onClick }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="p-1.5 rounded-md text-gray-700 hover:bg-gray-200"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-gray-300" />;
}
