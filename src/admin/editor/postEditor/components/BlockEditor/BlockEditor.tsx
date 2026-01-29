import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import styles from './BlockEditor.module.css';
import type { ParagraphBlock, PostBlock, TextAlign } from '../../postEditor.types';
import type { EditorSelectionStyle } from './types';

import { renderParagraphHtml } from './utils/htmlRenderer';
import { serializeDomToTextAndSpans } from './utils/domSerializer';
import { cloneRangeIfInside, getSelectionRangeWithin } from './utils/selectionRange';
import {
  cleanupTypingSpanArtifacts,
  ensureTypingSpan,
  stabilizeCaretIntoNearestTypingSpan,
} from './utils/typingSpan';
import { readSelectionStyle } from './utils/selectionStyle';

export type BlockEditorHandle = {
  applyBold: () => void;
  applyFontFamily: (fontFamilyLabel: string) => void;
  applyFontSize: (fontSize: number) => void;
  applyAlign: (align: TextAlign) => void;
  focus: () => void;
};

type Props = {
  blocks: PostBlock[];
  onChange: (id: string, patch: Partial<PostBlock>) => void;
  onSelectionStyleChange: (style: EditorSelectionStyle) => void;
};

type PendingInlineStyle = Partial<CSSStyleDeclaration>;

const TYPING_SELECTOR = '[data-typing-span="1"]';
const ZWSP = '\u200B';

function getTypingTextNode(span: HTMLElement): Text | null {
  const n = span.firstChild;
  if (!n || n.nodeType !== Node.TEXT_NODE) return null;
  return n as Text;
}

function placeCaretInTypingText(tn: Text, offset: number) {
  const sel = window.getSelection();
  if (!sel) return;

  const value = tn.nodeValue ?? '';
  const safe = Math.max(0, Math.min(offset, value.length));

  const r = document.createRange();
  r.setStart(tn, safe);
  r.collapse(true);
  sel.removeAllRanges();
  sel.addRange(r);
}

/**
 * ✅ “글자 자체”를 typing-span 안에 강제로 넣는다.
 * - 브라우저 기본 insertText는 span 밖(이전 11 텍스트)에 꽂히는 케이스가 있어서,
 *   insertText는 preventDefault + 수동 삽입이 필요함.
 */
function insertTextIntoTypingSpan(root: HTMLElement, text: string, pendingStyle: PendingInlineStyle) {
  // 1) 커서 확보
  const r0 = getSelectionRangeWithin(root);
  if (!r0 || !r0.collapsed) return;

  // 2) 가능하면 커서를 typing span 쪽으로 먼저 끌어온다 (ELEMENT/TEXT 튐 대응)
  stabilizeCaretIntoNearestTypingSpan(root);

  // 3) 다시 range 확인
  let r = getSelectionRangeWithin(root);
  if (!r || !r.collapsed) return;

  // 4) 커서 주변에서 typing span 찾기
  const containerEl =
    r.startContainer.nodeType === Node.ELEMENT_NODE
      ? (r.startContainer as HTMLElement)
      : (r.startContainer.parentElement as HTMLElement | null);

  let typing = (containerEl?.closest?.(TYPING_SELECTOR) as HTMLElement | null) ?? null;

  // 5) typing span이 없으면 “현재 pending 스타일”로 생성
  if (!typing) {
    ensureTypingSpan(root, pendingStyle, r);
    stabilizeCaretIntoNearestTypingSpan(root);

    r = getSelectionRangeWithin(root);
    if (!r || !r.collapsed) return;

    const c2 =
      r.startContainer.nodeType === Node.ELEMENT_NODE
        ? (r.startContainer as HTMLElement)
        : (r.startContainer.parentElement as HTMLElement | null);

    typing = (c2?.closest?.(TYPING_SELECTOR) as HTMLElement | null) ?? null;
    if (!typing) return;
  }

  const tn = getTypingTextNode(typing);
  if (!tn) return;

  // 6) 텍스트 노드 형태 정규화: (사용자 텍스트) + ZWSP 1개
  const raw = tn.nodeValue ?? '';
  const stripped = raw.replaceAll(ZWSP, '');
  tn.nodeValue = `${stripped}${ZWSP}`;

  // 7) 삽입 위치 계산: ZWSP “앞”으로 제한
  const value = tn.nodeValue ?? '';
  const maxOffset = value.endsWith(ZWSP) ? value.length - 1 : value.length;

  // selection이 tn을 가리키는 게 아니라면 끝에 삽입
  const sel = window.getSelection();
  const curOffset =
    sel && sel.rangeCount > 0 && sel.getRangeAt(0).startContainer === tn ? sel.getRangeAt(0).startOffset : maxOffset;

  const at = Math.max(0, Math.min(curOffset, maxOffset));

  // 8) 실제 삽입
  const before = value.slice(0, at);
  const after = value.slice(at);
  tn.nodeValue = `${before}${text}${after}`;

  // 9) 커서 이동(삽입한 텍스트 뒤)
  placeCaretInTypingText(tn, at + text.length);
}

function applyInlineStyle(root: HTMLElement, style: Partial<CSSStyleDeclaration>, savedRange?: Range | null) {
  root.focus();

  const range = savedRange ?? getSelectionRangeWithin(root);
  if (!range) return;

  if (range.collapsed) {
    ensureTypingSpan(root, style, range);
    stabilizeCaretIntoNearestTypingSpan(root);
    return;
  }

  const sel = window.getSelection();
  if (!sel) return;

  const span = document.createElement('span');
  Object.assign(span.style, style);

  const frag = range.extractContents();
  span.appendChild(frag);
  range.insertNode(span);

  sel.removeAllRanges();
  const r = document.createRange();
  r.selectNodeContents(span);
  r.collapse(false);
  sel.addRange(r);
}

type BeforeInputEvt = React.FormEvent<HTMLDivElement> & {
  nativeEvent: InputEvent;
};

export default forwardRef<BlockEditorHandle, Props>(function BlockEditor(
  { blocks, onChange, onSelectionStyleChange },
  ref
) {
  const block = useMemo(() => blocks.find((b) => b.type === 'paragraph') as ParagraphBlock | undefined, [blocks]);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const isFocusedRef = useRef(false);
  const savedRangeRef = useRef<Range | null>(null);

  // ✅ “다음 입력(typing)”에 적용할 스타일을 보관
  const pendingStyleRef = useRef<PendingInlineStyle>({});

  const syncSelectionStyle = () => {
    const el = editorRef.current;
    if (!el) return;
    onSelectionStyleChange(readSelectionStyle(el));
  };

  const saveSelection = () => {
    const el = editorRef.current;
    if (!el) return;
    const r = cloneRangeIfInside(el);
    if (!r) return;
    savedRangeRef.current = r;
    syncSelectionStyle();
  };

  const commit = () => {
    const el = editorRef.current;
    if (!el || !block) return;

    cleanupTypingSpanArtifacts(el);
    stabilizeCaretIntoNearestTypingSpan(el);

    const { text, spans } = serializeDomToTextAndSpans(el);
    onChange(block.id, { text, spans } as any);
  };

  // 외부 상태 → DOM 반영 (focus 중에는 덮어쓰기 금지)
  useEffect(() => {
    const el = editorRef.current;
    if (!el || !block) return;
    if (isFocusedRef.current) return;

    el.innerHTML = renderParagraphHtml(block.text ?? '', block.spans);
    el.style.textAlign = (block.align ?? 'left') as any;

    syncSelectionStyle();
  }, [block?.text, block?.spans, block?.align]); // eslint-disable-line react-hooks/exhaustive-deps

  // selectionchange: 에디터 내부 selection만 반응
  useEffect(() => {
    const onSel = () => {
      const el = editorRef.current;
      if (!el) return;
      const r = getSelectionRangeWithin(el);
      if (!r) return;
      savedRangeRef.current = r.cloneRange();
      syncSelectionStyle();
    };
    document.addEventListener('selectionchange', onSel);
    return () => document.removeEventListener('selectionchange', onSel);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => editorRef.current?.focus(),

      applyBold: () => {
        const el = editorRef.current;
        if (!el) return;

        const cur = readSelectionStyle(el);
        const nextWeight = cur.bold ? '400' : '800';

        pendingStyleRef.current.fontWeight = nextWeight;

        applyInlineStyle(el, { fontWeight: nextWeight }, savedRangeRef.current);

        commit();
        saveSelection();
      },

      applyFontFamily: (fontFamilyLabel: string) => {
        const el = editorRef.current;
        if (!el) return;

        const ff = fontFamilyLabel === '기본서체' ? '' : fontFamilyLabel;

        pendingStyleRef.current.fontFamily = ff;

        applyInlineStyle(el, { fontFamily: ff }, savedRangeRef.current);

        commit();
        saveSelection();
      },

      applyFontSize: (fontSize: number) => {
        const el = editorRef.current;
        if (!el) return;

        const px = `${fontSize}px`;

        pendingStyleRef.current.fontSize = px;

        applyInlineStyle(el, { fontSize: px }, savedRangeRef.current);

        commit();
        saveSelection();
      },

      applyAlign: (align: TextAlign) => {
        if (!block) return;
        onChange(block.id, { align } as any);

        const el = editorRef.current;
        if (el) {
          el.style.textAlign = align as any;
          onSelectionStyleChange({ ...readSelectionStyle(el), align });
        }
      },
    }),
    [block, onChange, onSelectionStyleChange]
  );

  if (!block) {
    return (
      <section className={styles.panel} aria-label="본문 편집">
        <div className={styles.canvas} data-placeholder="내용을 입력하세요." />
      </section>
    );
  }

  return (
    <section className={styles.panel} aria-label="본문 편집">
      <div
        ref={editorRef}
        className={styles.canvas}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        data-placeholder="내용을 입력하세요."
        onFocus={() => {
          isFocusedRef.current = true;
          saveSelection();
        }}
        onBlur={() => {
          isFocusedRef.current = false;
          commit();
        }}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onBeforeInput={(e) => {
          const el = editorRef.current;
          if (!el) return;

          const ne = (e as BeforeInputEvt).nativeEvent;

          if (ne.inputType === 'insertText' && typeof ne.data === 'string') {
            e.preventDefault();
            insertTextIntoTypingSpan(el, ne.data, pendingStyleRef.current);

            commit();
            saveSelection();
          }
        }}
        onInput={() => {
          // IME/붙여넣기 등은 여기서 처리
          commit();
          saveSelection();
        }}
      />
    </section>
  );
});
