import type { InteriorCategoryKey } from '@/types/page';

export type EditorKind = 'interior' | 'furniture';

export type TextAlign = 'left' | 'center' | 'right';

/**
 * (Legacy) Block editor types.
 * - 기존 BlockEditor 컴포넌트가 남아있을 경우(미사용이어도) TS 빌드를 위해 유지.
 * - Lexical 전환이 완료되면 BlockEditor 관련 파일과 함께 삭제 가능.
 */
export type InlineMarks = {
  bold?: boolean;
  fontSize?: number; // px
  fontFamily?: string;
};

export type InlineSpan = {
  start: number; // inclusive
  end: number; // exclusive
  marks: InlineMarks;
};

export type ParagraphBlock = {
  id: string;
  type: 'paragraph';
  text: string;
  align?: TextAlign;
  spans?: InlineSpan[];
};

export type PostBlock =
  | { id: string; type: 'heading'; level: 2 | 3; text: string }
  | ParagraphBlock
  | { id: string; type: 'quote'; text: string }
  | { id: string; type: 'image'; url: string; alt?: string }
  | { id: string; type: 'link'; href: string; label: string };

export type PostBlockInput =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'image'; url: string; alt?: string }
  | { type: 'link'; href: string; label: string };

/**
 * Lexical editorState JSON string wrapper.
 */
export type LexicalContent = {
  type: 'lexical';
  value: string; // editorState JSON string
};

export type PostDraft = {
  kind: EditorKind;

  title: string;
  period: string;

  // interior만 사용
  category?: InteriorCategoryKey;

  /** 본문 (Lexical) */
  content: LexicalContent;

  updatedAt: string;
};

export type PublishResult =
  | { ok: true; draft: PostDraft }
  | { ok: false; message: string };
