import { useEffect, useRef, useState } from 'react';
import { useFsStore } from '../../os/fsStore';
import { useWindowStore } from '../../os/windowStore';
import { useTextEditIntent } from '../../os/textEditIntent';
import { useAppMenuActions } from '../../os/menuActionStore';
import './textedit.css';

export default function TextEdit({ windowId }: { windowId: string }) {
  const consumePending = useTextEditIntent((s) => s.consume);
  const getNode = useFsStore((s) => s.getNode);
  const updateContent = useFsStore((s) => s.updateContent);
  const createFile = useFsStore((s) => s.createFile);
  const setTitle = useWindowStore((s) => s.setTitle);

  const [fileId, setFileId] = useState<string | null>(null);
  const [saved, setSaved] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pendingFileId = consumePending(windowId);
    if (pendingFileId) {
      const node = getNode(pendingFileId);
      if (node) {
        setFileId(node.id);
        setTitle(windowId, node.name);
        if (editorRef.current) editorRef.current.innerText = node.content ?? '';
      }
    } else {
      setTitle(windowId, 'Untitled.txt');
    }
  }, [windowId]);

  const doSave = () => {
    const text = editorRef.current?.innerText ?? '';
    if (fileId) {
      updateContent(fileId, text);
    } else {
      const name = window.prompt('Save As:', 'Untitled.txt');
      if (!name) return;
      const id = createFile('documents', name, text);
      setFileId(id);
      setTitle(windowId, name);
    }
    setSaved(true);
  };

  const doNew = () => {
    setFileId(null);
    setTitle(windowId, 'Untitled.txt');
    if (editorRef.current) editorRef.current.innerText = '';
    setSaved(true);
  };

  const format = (cmd: string) => {
    document.execCommand(cmd);
    editorRef.current?.focus();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        doSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  useAppMenuActions(windowId, {
    new: doNew,
    save: doSave,
    bold: () => format('bold'),
    italic: () => format('italic'),
    underline: () => format('underline'),
  });

  return (
    <div className="textedit">
      <div className="textedit-toolbar">
        <button onClick={doNew}>New</button>
        <button onClick={doSave}>Save {saved ? '' : '•'}</button>
        <span className="textedit-divider" />
        <button onClick={() => format('bold')}>
          <b>B</b>
        </button>
        <button onClick={() => format('italic')}>
          <i>I</i>
        </button>
        <button onClick={() => format('underline')}>
          <u>U</u>
        </button>
      </div>
      <div
        ref={editorRef}
        className="textedit-body"
        contentEditable
        onInput={() => setSaved(false)}
        suppressContentEditableWarning
      />
    </div>
  );
}
