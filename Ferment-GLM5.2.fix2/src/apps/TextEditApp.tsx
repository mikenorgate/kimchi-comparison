import { useState, useRef } from 'react';
import { GlassSurface } from '@/components/glass/GlassSurface';

const FONT_SIZES = [12, 14, 16, 18, 24];
const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.';

type Align = 'left' | 'center' | 'right';

export default function TextEditApp({ windowId: _windowId }: { windowId?: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState<number>(14);
  const [bold, setBold] = useState<boolean>(false);
  const [italic, setItalic] = useState<boolean>(false);
  const [underline, setUnderline] = useState<boolean>(false);
  const [align, setAlign] = useState<Align>('left');

  const exec = (command: string, value?: string) => {
    // Focus keeps the selection active before applying the command.
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  };

  const toggleBold = () => {
    exec('bold');
    setBold((v) => !v);
  };
  const toggleItalic = () => {
    exec('italic');
    setItalic((v) => !v);
  };
  const toggleUnderline = () => {
    exec('underline');
    setUnderline((v) => !v);
  };

  const setAlignment = (a: Align) => {
    setAlign(a);
    if (a === 'left') exec('justifyLeft');
    if (a === 'center') exec('justifyCenter');
    if (a === 'right') exec('justifyRight');
  };

  const changeFontSize = (size: number) => {
    setFontSize(size);
    // The container inline style applies the pixel font-size to the editor.
  };

  return (
    <GlassSurface
      variant="regular"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          borderBottom: '1px solid var(--glass-border-inner)',
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        <select
          value={fontSize}
          onChange={(e) => changeFontSize(Number(e.target.value))}
          style={selectStyle}
          aria-label="Font size"
        >
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}px
            </option>
          ))}
        </select>

        <div style={{ width: 1, height: 22, background: 'var(--glass-border-inner)' }} />

        <button
          onClick={toggleBold}
          style={toolBtn(bold)}
          aria-pressed={bold}
          aria-label="Bold"
        >
          <b>B</b>
        </button>
        <button
          onClick={toggleItalic}
          style={toolBtn(italic)}
          aria-pressed={italic}
          aria-label="Italic"
        >
          <i>I</i>
        </button>
        <button
          onClick={toggleUnderline}
          style={toolBtn(underline)}
          aria-pressed={underline}
          aria-label="Underline"
        >
          <u>U</u>
        </button>

        <div style={{ width: 1, height: 22, background: 'var(--glass-border-inner)' }} />

        <button
          onClick={() => setAlignment('left')}
          style={toolBtn(align === 'left')}
          aria-pressed={align === 'left'}
          aria-label="Align left"
        >
          ⬅
        </button>
        <button
          onClick={() => setAlignment('center')}
          style={toolBtn(align === 'center')}
          aria-pressed={align === 'center'}
          aria-label="Align center"
        >
          ↔
        </button>
        <button
          onClick={() => setAlignment('right')}
          style={toolBtn(align === 'right')}
          aria-pressed={align === 'right'}
          aria-label="Align right"
        >
          ➡
        </button>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 16 }}>
        <div
          ref={editorRef}
          data-testid="textedit-editor"
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          style={{
            minHeight: '100%',
            fontSize: `${fontSize}px`,
            fontWeight: bold ? 700 : 400,
            fontStyle: italic ? 'italic' : 'normal',
            textDecoration: underline ? 'underline' : 'none',
            textAlign: align,
            color: 'var(--text-primary)',
            outline: 'none',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}
        >
          {LOREM}
        </div>
      </div>
    </GlassSurface>
  );
}

const selectStyle: React.CSSProperties = {
  padding: '4px 8px',
  borderRadius: 8,
  border: '1px solid var(--glass-border-inner)',
  background: 'var(--window-bg)',
  color: 'var(--text-primary)',
  fontSize: 13,
  cursor: 'pointer',
  outline: 'none',
};

function toolBtn(active: boolean): React.CSSProperties {
  return {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: 'none',
    background: active ? 'var(--accent)' : 'transparent',
    color: active ? 'var(--window-bg)' : 'var(--text-primary)',
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}
