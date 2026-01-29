import type { InlineMarks, InlineSpan } from '../../../postEditor.types';
import { stripZwsp } from './typingSpan';

function normalizeSpans(spans: InlineSpan[] | undefined, textLen: number): InlineSpan[] {
  const src = Array.isArray(spans) ? spans : [];
  const cleaned = src
    .map((s) => ({
      start: Math.max(0, Math.min(textLen, s.start)),
      end: Math.max(0, Math.min(textLen, s.end)),
      marks: s.marks ?? {},
    }))
    .filter((s) => s.end > s.start && Object.keys(s.marks).length > 0);

  const merged: InlineSpan[] = [];
  for (const s of cleaned.sort((a, b) => a.start - b.start)) {
    const last = merged[merged.length - 1];
    const same = last && last.end === s.start && JSON.stringify(last.marks) === JSON.stringify(s.marks);
    if (same) last.end = s.end;
    else merged.push({ ...s, marks: { ...s.marks } });
  }
  return merged;
}

export function serializeDomToTextAndSpans(root: HTMLElement): { text: string; spans: InlineSpan[] } {
  const spans: InlineSpan[] = [];
  let text = '';
  let offset = 0;

  const pushSpan = (start: number, end: number, marks: InlineMarks) => {
    if (end <= start) return;
    if (!marks || Object.keys(marks).length === 0) return;
    spans.push({ start, end, marks });
  };

  const parseMarksFromElement = (el: Element): InlineMarks => {
    const marks: InlineMarks = {};
    const tag = el.tagName.toLowerCase();
    if (tag === 'b' || tag === 'strong') marks.bold = true;

    const style = (el as HTMLElement).style;

    if (style.fontWeight) {
      const w = Number(style.fontWeight);
      if (!Number.isNaN(w) && w >= 700) marks.bold = true;
      if (style.fontWeight === 'bold') marks.bold = true;
    }

    if (style.fontSize) {
      const n = Number(style.fontSize.replace('px', ''));
      if (!Number.isNaN(n)) marks.fontSize = n;
    }

    if (style.fontFamily) marks.fontFamily = style.fontFamily.replaceAll('"', '').trim();

    return marks;
  };

  const walk = (node: Node, inherited: InlineMarks) => {
    if (node.nodeType === Node.TEXT_NODE) {
      let s = node.nodeValue ?? '';
      if (!s) return;

      s = stripZwsp(s);
      if (!s) return;

      const start = offset;
      text += s;
      offset += s.length;

      pushSpan(start, offset, inherited);
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    if (tag === 'br') {
      text += '\n';
      offset += 1;
      return;
    }

    if (tag === 'div' || tag === 'p') {
      for (const child of Array.from(el.childNodes)) walk(child, inherited);
      return;
    }

    const own = parseMarksFromElement(el);
    const next: InlineMarks = { ...inherited, ...own };

    for (const child of Array.from(el.childNodes)) walk(child, next);
  };

  // ✅ 핵심: root 직계 div/p는 "줄"로 취급. div 사이에 \n 삽입.
  const children = Array.from(root.childNodes);

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    walk(child, {});

    const isBlock =
      child.nodeType === Node.ELEMENT_NODE &&
      ['div', 'p'].includes((child as Element).tagName.toLowerCase());

    if (isBlock && i < children.length - 1) {
      // 이미 끝이 \n이면 중복 추가 안 함
      if (!text.endsWith('\n')) {
        text += '\n';
        offset += 1;
      }
    }
  }

  return { text, spans: normalizeSpans(spans, text.length) };
}
