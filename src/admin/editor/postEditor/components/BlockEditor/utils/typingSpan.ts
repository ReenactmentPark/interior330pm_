import { getSelectionRangeWithin, restoreRange } from './selectionRange';

const ZWSP = '\u200B';
const TYPING_ATTR = 'data-typing-span';

function getTypingTextNode(span: HTMLElement): Text | null {
  const tn = span.firstChild;
  if (!tn || tn.nodeType !== Node.TEXT_NODE) return null;
  return tn as Text;
}

export function placeCaretBeforeTrailingZwsp(span: HTMLElement) {
  const tn = getTypingTextNode(span);
  if (!tn) return;

  const value = tn.nodeValue ?? '';
  const hasTrailing = value.endsWith(ZWSP);
  const offset = Math.max(0, Math.min(value.length, hasTrailing ? value.length - 1 : value.length));

  const sel = window.getSelection();
  if (!sel) return;

  const r = document.createRange();
  r.setStart(tn, offset);
  r.collapse(true);
  sel.removeAllRanges();
  sel.addRange(r);
}

/**
 * ✅ 브라우저가 caret을 typing span "밖"에 두는 케이스를 강제로 복구
 * - startContainer가 ELEMENT(root)인 경우: prev/next에서 typing span 탐색
 * - startContainer가 TEXT인 경우: offset이 text 끝이면 nextSibling 쪽 typing span 탐색
 */
export function stabilizeCaretIntoNearestTypingSpan(root: HTMLElement) {
  const range = getSelectionRangeWithin(root);
  if (!range || !range.collapsed) return;

  const sc = range.startContainer;

  // 1) TEXT_NODE 케이스: 커서가 기존 텍스트(11) 끝에 있고 nextSibling에 typing-span(30)이 있는데도
  // 브라우저가 커서를 span 안으로 안 넣는 경우가 있음 → 강제로 nextSibling typing-span으로 이동
  if (sc.nodeType === Node.TEXT_NODE) {
    const tn = sc as Text;
    const parent = tn.parentElement;
    if (!parent || !root.contains(parent)) return;

    const atEnd = range.startOffset === (tn.nodeValue?.length ?? 0);
    if (!atEnd) return;

    // 부모 기준으로 다음 형제에서 typing span을 찾기
    const next = parent.nextSibling;
    const nextEl =
      next?.nodeType === Node.ELEMENT_NODE ? (next as HTMLElement) : next?.nodeType === Node.TEXT_NODE ? next.parentElement : null;

    const typing = (nextEl?.closest?.(`[${TYPING_ATTR}="1"]`) as HTMLElement | null) ?? null;
    if (typing && root.contains(typing)) {
      placeCaretBeforeTrailingZwsp(typing);
      // 한 번 더(렌더/selection 튐 방지)
      requestAnimationFrame(() => placeCaretBeforeTrailingZwsp(typing));
    }
    return;
  }

  // 2) ELEMENT_NODE 케이스: caret이 root로 튀는 케이스
  if (sc.nodeType !== Node.ELEMENT_NODE) return;

  const el = sc as HTMLElement;
  if (!root.contains(el)) return;

  const children = el.childNodes;
  const offset = range.startOffset;

  const prev = offset - 1 >= 0 ? children[offset - 1] : null;
  const next = offset < children.length ? children[offset] : null;

  const nodeToEl = (n: Node | null): HTMLElement | null => {
    if (!n) return null;
    if (n.nodeType === Node.ELEMENT_NODE) return n as HTMLElement;
    if (n.nodeType === Node.TEXT_NODE) return (n as Text).parentElement;
    return null;
  };

  const pickTyping = (n: Node | null) => {
    const base = nodeToEl(n);
    return (base?.closest?.(`[${TYPING_ATTR}="1"]`) as HTMLElement | null) ?? null;
  };

  const t1 = pickTyping(prev);
  if (t1 && root.contains(t1)) {
    placeCaretBeforeTrailingZwsp(t1);
    requestAnimationFrame(() => placeCaretBeforeTrailingZwsp(t1));
    return;
  }

  const t2 = pickTyping(next);
  if (t2 && root.contains(t2)) {
    placeCaretBeforeTrailingZwsp(t2);
    requestAnimationFrame(() => placeCaretBeforeTrailingZwsp(t2));
  }
}

export function ensureTypingSpan(root: HTMLElement, style: Partial<CSSStyleDeclaration>, savedRange?: Range | null) {
  const range = savedRange ?? getSelectionRangeWithin(root);
  if (!range) return;

  restoreRange(range);

  const active = getSelectionRangeWithin(root);
  if (!active || !active.collapsed) return;

  const container =
    active.startContainer.nodeType === Node.ELEMENT_NODE
      ? (active.startContainer as HTMLElement)
      : (active.startContainer.parentElement as HTMLElement | null);

  const existingTyping = container?.closest?.(`[${TYPING_ATTR}="1"]`) as HTMLElement | null;

  if (existingTyping && root.contains(existingTyping)) {
    Object.assign(existingTyping.style, style);
    placeCaretBeforeTrailingZwsp(existingTyping);
    // ✅ 한 번 더 강제(브라우저가 selection을 되돌리는 케이스 방어)
    requestAnimationFrame(() => placeCaretBeforeTrailingZwsp(existingTyping));
    return;
  }

  const span = document.createElement('span');
  span.setAttribute(TYPING_ATTR, '1');
  Object.assign(span.style, style);

  const tn = document.createTextNode(ZWSP);
  span.appendChild(tn);

  active.insertNode(span);

  const sel = window.getSelection();
  if (!sel) return;

  const r = document.createRange();
  r.setStart(tn, 0);
  r.collapse(true);
  sel.removeAllRanges();
  sel.addRange(r);

  // ✅ selection이 다시 튀는 걸 막기 위해 다음 프레임에 한 번 더 고정
  requestAnimationFrame(() => placeCaretBeforeTrailingZwsp(span));
}

export function cleanupTypingSpanArtifacts(root: HTMLElement) {
  const typingSpans = Array.from(root.querySelectorAll(`[${TYPING_ATTR}="1"]`)) as HTMLElement[];

  for (const span of typingSpans) {
    const tn = getTypingTextNode(span);
    if (!tn) continue;

    const before = tn.nodeValue ?? '';
    const stripped = before.replaceAll(ZWSP, '');
    const next = `${stripped}${ZWSP}`;
    if (next !== before) tn.nodeValue = next;
  }
}

export function stripZwsp(text: string) {
  return text.replaceAll(ZWSP, '');
}
