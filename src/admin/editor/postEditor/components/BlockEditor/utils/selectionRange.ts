export function getSelectionRangeWithin(root: HTMLElement): Range | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return null;
  return range;
}

export function restoreRange(range: Range) {
  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();
  sel.addRange(range);
}

export function cloneRangeIfInside(root: HTMLElement): Range | null {
  const r = getSelectionRangeWithin(root);
  return r ? r.cloneRange() : null;
}
