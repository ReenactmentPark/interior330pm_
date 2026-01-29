import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

import {
  $getSelection,
  $isRangeSelection,
  $isElementNode,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  KEY_ENTER_COMMAND,
  INSERT_PARAGRAPH_COMMAND,
  type EditorState,
  type ElementNode,
  type LexicalEditor,
  type LexicalNode,
  type RangeSelection,
} from 'lexical';

import { $patchStyleText } from '@lexical/selection';

import type { TextAlign } from '../../postEditor.types';
import styles from './LexicalEditor.module.css';

import ImagesPlugin, { INSERT_IMAGE_COMMAND } from './plugins/ImagesPlugin';
import ImageDragDropPastePlugin from './plugins/ImageDragDropPastePlugin';
import { ImageNode } from './plugins/ImageNode';

import { $getSelectionStyleValueForProperty } from '@lexical/selection';
export type EditorSelectionStyle = {
  bold: boolean;
  fontFamilyLabel: string;
  fontSize: number;
  align: TextAlign;
  color: string;
};

export type LexicalEditorHandle = {
  focus: () => void;
  applyBold: () => void;
  applyFontFamily: (fontFamilyLabel: string) => void;
  applyFontSize: (fontSize: number) => void;
  applyAlign: (align: TextAlign) => void;
  requestInsertImage: () => void;
  applyColor: (cssColor: string) => void;
};

type Props = {
  value: string;
  onChange: (nextJson: string) => void;
  onSelectionStyleChange: (style: EditorSelectionStyle) => void;

  pickImage: () => Promise<string | null>;
  uploadImage: (file: File) => Promise<string>;
};

function parseInlineStyle(styleText: string): { fontSize?: number; fontFamilyLabel?: string } {
  const res: { fontSize?: number; fontFamilyLabel?: string } = {};
  const parts = styleText
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const p of parts) {
    const idx = p.indexOf(':');
    if (idx < 0) continue;
    const k = p.slice(0, idx).trim().toLowerCase();
    const v = p.slice(idx + 1).trim();

    if (k === 'font-size') {
      const m = v.match(/(\d+)/);
      if (m) res.fontSize = Number(m[1]);
    }
    if (k === 'font-family') {
      const cleaned = v.replace(/^['"]|['"]$/g, '');
      res.fontFamilyLabel = cleaned || '기본서체';
    }
  }
  return res;
}

function normalizeFontFamilyLabel(label: string): string {
  return label === '기본서체' ? '' : label;
}

function styleTextToMap(styleText: string): Record<string, string> {
  const map: Record<string, string> = {};
  const parts = styleText
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const p of parts) {
    const idx = p.indexOf(':');
    if (idx < 0) continue;
    const k = p.slice(0, idx).trim().toLowerCase();
    const v = p.slice(idx + 1).trim();
    if (!k) continue;
    map[k] = v;
  }
  return map;
}

function mapToStyleText(map: Record<string, string>): string {
  return Object.entries(map)
    .filter(([_, v]) => v != null && String(v).trim() !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
}

function getSelectionStyleText(selection: RangeSelection): string {
  return (selection as unknown as { style?: string }).style ?? '';
}

function applyInlineStyle(editor: LexicalEditor, patch: Record<string, string>) {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    const styleText = getSelectionStyleText(selection);
    const map = styleTextToMap(styleText);

    for (const [k, v] of Object.entries(patch)) {
      map[k.toLowerCase()] = v;
    }

    const nextStyle = mapToStyleText(map);

    if (selection.isCollapsed()) {
      selection.setStyle(nextStyle);
      return;
    }

    $patchStyleText(selection, patch);
  });
}

function getCurrentBlockElement(selection: RangeSelection): ElementNode | null {
  const anchorNode = selection.anchor.getNode() as LexicalNode;
  if ($isElementNode(anchorNode)) return anchorNode;

  let parent: LexicalNode | null = anchorNode.getParent();
  while (parent) {
    if ($isRootOrShadowRoot(parent)) return null;
    if ($isElementNode(parent)) return parent;
    parent = parent.getParent();
  }
  return null;
}

function readAlignFromSelection(selection: RangeSelection): TextAlign {
  const el = getCurrentBlockElement(selection);
  if (!el) return 'left';

  const t = el.getFormatType();
  if (t === 'center') return 'center';
  if (t === 'right') return 'right';
  return 'left';
}

function computeSelectionStyle(): EditorSelectionStyle | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return null;

  const bold = selection.hasFormat('bold');
  const styleText = getSelectionStyleText(selection);
  const parsed = parseInlineStyle(styleText);
  const align = readAlignFromSelection(selection);
  const color = $getSelectionStyleValueForProperty(selection, 'color', 'rgb(0, 0, 0)');

  return {
    bold,
    fontFamilyLabel: parsed.fontFamilyLabel ?? '기본서체',
    fontSize: parsed.fontSize ?? 15,
    align,
    color,
  };
}

function SyncExternalValuePlugin({
  value,
  lastEmittedRef,
}: {
  value: string;
  lastEmittedRef: React.MutableRefObject<string | null>;
}) {
  const [editor] = useLexicalComposerContext();
  const lastApplied = useRef<string | null>(null);

  useEffect(() => {
    if (!value) return;
    if (lastEmittedRef.current === value) return;
    if (lastApplied.current === value) return;

    try {
      const next = editor.parseEditorState(value);
      editor.setEditorState(next);
      lastApplied.current = value;
    } catch {
      // ignore
    }
  }, [editor, value, lastEmittedRef]);

  return null;
}

function ShiftEnterParagraphPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        const e = event as KeyboardEvent | null;
        if (!e) return false;
        if (!e.shiftKey) return false;

        e.preventDefault();
        editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return null;
}

function SelectionStylePlugin({ onSelectionStyleChange }: { onSelectionStyleChange: Props['onSelectionStyleChange'] }) {
  const [editor] = useLexicalComposerContext();
  const last = useRef<EditorSelectionStyle | null>(null);

  const emitIfChanged = (next: EditorSelectionStyle | null) => {
    if (!next) return;
    const prev = last.current;
    if (
      !prev ||
      prev.bold !== next.bold ||
      prev.fontFamilyLabel !== next.fontFamilyLabel ||
      prev.fontSize !== next.fontSize ||
      prev.align !== next.align ||
      prev.color !== next.color
    ) {
      last.current = next;
      onSelectionStyleChange(next);
    }
  };

  useEffect(() => {
    const unregisterSelection = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        editor.getEditorState().read(() => {
          emitIfChanged(computeSelectionStyle());
        });
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    const unregisterUpdate = editor.registerUpdateListener(({ editorState }: { editorState: EditorState }) => {
      editorState.read(() => {
        emitIfChanged(computeSelectionStyle());
      });
    });

    return () => {
      unregisterSelection();
      unregisterUpdate();
    };
  }, [editor, onSelectionStyleChange]);

  return null;
}

const LexicalEditorImpl = forwardRef<LexicalEditorHandle, Props>(function LexicalEditorImpl(
  { value, onChange, onSelectionStyleChange, pickImage, uploadImage },
  ref
) {
  const composerEditorRef = useRef<LexicalEditor | null>(null);
  const handleRef = useRef<LexicalEditorHandle | null>(null);

  const lastEmittedRef = useRef<string | null>(null);

  const initialConfig = useMemo(
    () => ({
      namespace: 'admin-post-editor',
      editorState: value,
      nodes: [ImageNode],
      onError: (err: Error) => {
        throw err;
      },
    }),
    []
  );

  useImperativeHandle(ref, () => {
    if (handleRef.current) return handleRef.current;

    const api: LexicalEditorHandle = {
      focus: () => composerEditorRef.current?.focus(),
      applyBold: () => composerEditorRef.current?.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold'),
      applyFontFamily: (fontFamilyLabel: string) => {
        const ff = normalizeFontFamilyLabel(fontFamilyLabel);
        const ed = composerEditorRef.current;
        if (!ed) return;
        applyInlineStyle(ed, { 'font-family': ff });
      },
      applyFontSize: (fontSize: number) => {
        const ed = composerEditorRef.current;
        if (!ed) return;
        applyInlineStyle(ed, { 'font-size': `${fontSize}px` });
      },
      applyAlign: (align: TextAlign) => composerEditorRef.current?.dispatchCommand(FORMAT_ELEMENT_COMMAND, align),
      requestInsertImage: () => {
        const ed = composerEditorRef.current;
        if (!ed) return;
        void (async () => {
          const url = await pickImage();
          if (!url) return;
          ed.focus();
          ed.dispatchCommand(INSERT_IMAGE_COMMAND, { src: url, altText: '' });
        })();
      },
      applyColor: (cssColor: string) => {
        const ed = composerEditorRef.current;
        if (!ed) return;
        applyInlineStyle(ed, { color: cssColor }); // ✅ 핵심: inline style color
      },
    };

    handleRef.current = api;
    return api;
  }, [pickImage]);

  function CaptureEditorPlugin() {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
      composerEditorRef.current = editor;
    }, [editor]);
    return null;
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <CaptureEditorPlugin />

      <div className={styles.panel} aria-label="본문 편집">
        <div className={styles.editorShell}>
          <RichTextPlugin
            contentEditable={<ContentEditable className={styles.content} />}
            placeholder={<div className={styles.placeholder}>내용을 입력하세요.</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />

          <HistoryPlugin />
          <ShiftEnterParagraphPlugin />

          <ImagesPlugin />
          <ImageDragDropPastePlugin uploadImage={uploadImage} />

          <OnChangePlugin
            onChange={(editorState: EditorState) => {
              const nextJson = JSON.stringify(editorState.toJSON());
              lastEmittedRef.current = nextJson;
              onChange(nextJson);
            }}
          />

          <SyncExternalValuePlugin value={value} lastEmittedRef={lastEmittedRef} />
          <SelectionStylePlugin onSelectionStyleChange={onSelectionStyleChange} />
        </div>
      </div>
    </LexicalComposer>
  );
});

export default LexicalEditorImpl;
