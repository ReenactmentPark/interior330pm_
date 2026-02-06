import { useCallback, useEffect, useMemo, useState } from 'react';
import type { EditorKind, PostDraft, PublishResult } from './postEditor.types';
import { clearDraft, EMPTY_LEXICAL_STATE_JSON, loadDraft, saveDraft } from './postEditor.storage';
import { extractUniqueImageUids, hasUnresolvedImages } from './postEditor.lexicalImages';

const makeEmptyDraft = (kind: EditorKind): PostDraft => ({
  kind,
  title: '',
  period: '',
  thumbnailImageUid: '',
  category: undefined,
  content: { type: 'lexical', value: EMPTY_LEXICAL_STATE_JSON },
  updatedAt: new Date().toISOString(),
});

function extractPlainTextFromLexicalJSON(jsonStr: string): string {
  try {
    const parsed = JSON.parse(jsonStr);
    const root = parsed?.root;
    const out: string[] = [];

    const walk = (node: any) => {
      if (!node) return;
      if (node.type === 'text' && typeof node.text === 'string') out.push(node.text);
      const children = node.children;
      if (Array.isArray(children)) {
        for (const c of children) walk(c);
        if (node.type === 'paragraph') out.push('\n');
      }
    };

    walk(root);
    return out.join('').replace(/\n{2,}/g, '\n').trim();
  } catch {
    return '';
  }
}

function countTopLevelBlocks(jsonStr: string): number {
  try {
    const parsed = JSON.parse(jsonStr);
    const children = parsed?.root?.children;
    if (!Array.isArray(children)) return 1;
    return Math.max(1, children.length);
  } catch {
    return 1;
  }
}

export function usePostEditor(kind: EditorKind) {
  const [draft, setDraft] = useState<PostDraft>(() => loadDraft(kind) ?? makeEmptyDraft(kind));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(loadDraft(kind) ?? makeEmptyDraft(kind));
    setDirty(false);
  }, [kind]);

  useEffect(() => {
    if (!dirty) return;
    const t = window.setTimeout(() => {
      saveDraft({ ...draft, updatedAt: new Date().toISOString() });
    }, 250);
    return () => window.clearTimeout(t);
  }, [draft, dirty]);

  const update = useCallback(<K extends keyof PostDraft>(key: K, value: PostDraft[K]) => {
    setDirty(true);
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateContent = useCallback((value: string) => {
    setDirty(true);
    setDraft((prev) => ({ ...prev, content: { type: 'lexical', value } }));
  }, []);

  const reset = useCallback(() => {
    clearDraft(kind);
    setDraft(makeEmptyDraft(kind));
    setDirty(false);
  }, [kind]);

  const validateAndPublish = useCallback((): PublishResult => {
    if (!draft.title.trim()) return { ok: false, message: '제목을 입력하세요.' };
    if (!draft.period.trim()) return { ok: false, message: '기간을 입력하세요.' };
    if (draft.kind === 'interior' && !draft.category) return { ok: false, message: '카테고리를 선택하세요.' };

    // ✅ 본문이 참조하는 이미지 목록(서버 인덱싱/검증용)
    const assetRefs = extractUniqueImageUids(draft.content.value);
    
    if (assetRefs.length === 0) {
      return { ok: false, message: '본문에 이미지를 먼저 삽입하세요.' };
    }

    if (!draft.thumbnailImageUid.trim()) return { ok: false, message: '대표 이미지를 선택하세요.' };

    // ✅ 대표 UID가 본문 이미지 중 하나인지 확인
    if (!assetRefs.includes(draft.thumbnailImageUid)) {
      return { ok: false, message: '대표 이미지가 본문에 존재하지 않습니다. 다시 선택하세요.' };
    }

    // ✅ image 노드는 있는데 imageUid가 비어있는 상태면 저장 불가
    if (hasUnresolvedImages(draft.content.value)) {
      return { ok: false, message: '이미지 등록이 완료되지 않았습니다. 다시 삽입하거나 업로드를 완료하세요.' };
    }

    const plain = extractPlainTextFromLexicalJSON(draft.content.value);
    if (!plain) return { ok: false, message: '본문을 입력하세요.' };

    saveDraft({ ...draft, updatedAt: new Date().toISOString() });
    setDirty(false);

    // ✅ 필요하면 PublishResult에 assetRefs를 같이 넣어도 됨(다음 단계용)
    return { ok: true, draft, assetRefs };
  }, [draft, saveDraft, setDirty]);

  const stats = useMemo(
    () => ({
      dirty,
      blockCount: countTopLevelBlocks(draft.content.value),
      updatedAt: draft.updatedAt,
    }),
    [dirty, draft.content.value, draft.updatedAt]
  );

  return { draft, update, updateContent, reset, validateAndPublish, stats };
}
