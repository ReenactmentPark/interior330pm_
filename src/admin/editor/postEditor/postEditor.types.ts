import type { InteriorCategoryKey } from '@/types/page';

export type EditorKind = 'interior' | 'furniture';
export type TextAlign = 'left' | 'center' | 'right';

export type InlineMarks = {
  bold?: boolean;
  fontSize?: number;
  fontFamily?: string;
};

export type InlineSpan = {
  start: number;
  end: number;
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

export type LexicalContent = {
  type: 'lexical';
  value: string;
};

export type PostDraft = {
  kind: EditorKind;

  title: string;
  period: string;

  /** 대표 이미지 UID (로컬/업로드 전 단계에서도 안정적으로 식별하기 위한 키) */
  thumbnailImageUid: string;

  category?: InteriorCategoryKey;

  content: LexicalContent;

  updatedAt: string;
};

export type PublishResult =
  | { ok: true; draft: PostDraft; assetRefs: string[] }
  | { ok: false; message: string };
