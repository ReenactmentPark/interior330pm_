import type { EditorKind, PostDraft } from './postEditor.types';

const keyOf = (kind: EditorKind) => `admin:post-editor:draft:${kind}`;

/**
 * Minimal Lexical editorState JSON for an empty editor.
 */
export const EMPTY_LEXICAL_STATE_JSON = JSON.stringify({
  root: {
    children: [
      {
        children: [],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
});

function plainTextToLexicalJSON(text: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, ' '))
    .map((p) => p.trimEnd());

  const children = paragraphs.map((p) => {
    const t = String(p ?? '');
    return {
      children: t
        ? [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: t,
              type: 'text',
              version: 1,
            },
          ]
        : [],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'paragraph',
      version: 1,
    };
  });

  return JSON.stringify({
    root: {
      children: children.length ? children : JSON.parse(EMPTY_LEXICAL_STATE_JSON).root.children,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  });
}

function migrateDraft(kind: EditorKind, raw: any): PostDraft {
  const nextKind: EditorKind = raw?.kind === 'furniture' ? 'furniture' : 'interior';
  const title = String(raw?.title ?? '');
  const period = String(raw?.period ?? '');
  const thumbnailUrl = String(raw?.thumbnailUrl ?? '');
  const category = raw?.category;
  const updatedAt = String(raw?.updatedAt ?? new Date().toISOString());

  // New schema
  const maybeContent = raw?.content;
  if (maybeContent?.type === 'lexical' && typeof maybeContent.value === 'string' && maybeContent.value.trim()) {
    return {
      kind: nextKind,
      title,
      period,
      category,
      content: { type: 'lexical', value: maybeContent.value },
      updatedAt,
    };
  }

  // Legacy schema: blocks[] → plain text → lexical
  const blocks = Array.isArray(raw?.blocks) ? raw.blocks : [];
  const legacyText = blocks
    .map((b: any) => (typeof b?.text === 'string' ? b.text : ''))
    .filter(Boolean)
    .join('\n\n');

  const value = legacyText.trim() ? plainTextToLexicalJSON(legacyText) : EMPTY_LEXICAL_STATE_JSON;

  return {
    kind,
    title,
    period,
    category,
    content: { type: 'lexical', value },
    updatedAt,
  };
}

export function loadDraft(kind: EditorKind): PostDraft | null {
  try {
    const raw = localStorage.getItem(keyOf(kind));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return migrateDraft(kind, parsed);
  } catch {
    return null;
  }
}

export function saveDraft(draft: PostDraft) {
  localStorage.setItem(keyOf(draft.kind), JSON.stringify(draft));
}

export function clearDraft(kind: EditorKind) {
  localStorage.removeItem(keyOf(kind));
}
