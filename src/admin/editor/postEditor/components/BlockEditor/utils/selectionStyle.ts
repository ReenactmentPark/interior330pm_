import type { TextAlign } from '../../../postEditor.types';
import type { EditorSelectionStyle } from '../types';
import { getSelectionRangeWithin } from './selectionRange';

function normalizeFontLabel(fontFamilyCss: string | null | undefined): string {
  const raw = (fontFamilyCss ?? '').toLowerCase();

  const looksDefault =
    raw.includes('pretendard') ||
    raw.includes('noto sans') ||
    raw.includes('roboto') ||
    raw.includes('system-ui') ||
    raw.includes('sans-serif') ||
    raw.trim() === '';

  if (looksDefault) return '기본서체';

  const first = (fontFamilyCss ?? '').split(',')[0]?.trim().replaceAll('"', '').replaceAll("'", '');
  return first || '기본서체';
}

export function readSelectionStyle(root: HTMLElement): EditorSelectionStyle {
  const range = getSelectionRangeWithin(root);
  const align = ((root.style.textAlign || window.getComputedStyle(root).textAlign) as TextAlign) || 'left';

  if (!range) return { bold: false, fontFamilyLabel: '기본서체', fontSize: 15, align };

  const node = range.startContainer;
  const el =
    node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : (node.parentElement as HTMLElement | null);

  const target = el && root.contains(el) ? el : root;
  const cs = window.getComputedStyle(target);

  const weight = cs.fontWeight;
  const bold = weight === 'bold' || Number(weight) >= 700;

  const fontSize = (() => {
    const n = Number((cs.fontSize || '15px').replace('px', ''));
    return Number.isFinite(n) ? n : 15;
  })();

  const fontFamilyLabel = normalizeFontLabel(cs.fontFamily);

  return { bold, fontFamilyLabel, fontSize, align };
}
