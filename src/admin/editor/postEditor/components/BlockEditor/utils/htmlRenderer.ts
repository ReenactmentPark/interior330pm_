import type { InlineMarks, InlineSpan } from '../../../postEditor.types';

const escapeHtml = (s: string) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function marksToStyle(m: InlineMarks): string {
  const parts: string[] = [];
  if (m.bold) parts.push('font-weight:800');
  if (typeof m.fontSize === 'number') parts.push(`font-size:${m.fontSize}px`);
  if (m.fontFamily) parts.push(`font-family:${m.fontFamily}`);
  return parts.join(';');
}

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

export function renderParagraphHtml(text: string, spans: InlineSpan[] | undefined): string {
  const len = text.length;
  const runs = normalizeSpans(spans, len);

  let cursor = 0;
  let html = '';

  const emit = (chunk: string, marks?: InlineMarks) => {
    if (!chunk) return;
    const safe = escapeHtml(chunk).replaceAll('\n', '<br/>');
    if (!marks || Object.keys(marks).length === 0) {
      html += safe;
      return;
    }
    html += `<span style="${marksToStyle(marks)}">${safe}</span>`;
  };

  for (const r of runs) {
    if (cursor < r.start) emit(text.slice(cursor, r.start));
    emit(text.slice(r.start, r.end), r.marks);
    cursor = r.end;
  }
  if (cursor < len) emit(text.slice(cursor));
  return html;
}
