import { useEffect, useMemo, useState } from 'react';
import styles from '../EditorToolbar.module.css';

function clamp(n: number) {
  return Math.max(0, Math.min(255, n));
}

function parseRgb(input: string): { r: number; g: number; b: number } | null {
  const s = input.trim();

  // rgb(12, 34, 56)
  const m1 = s.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
  if (m1) return { r: clamp(Number(m1[1])), g: clamp(Number(m1[2])), b: clamp(Number(m1[3])) };

  // 12,34,56
  const m2 = s.match(/^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/);
  if (m2) return { r: clamp(Number(m2[1])), g: clamp(Number(m2[2])), b: clamp(Number(m2[3])) };

  // #rrggbb
  const m3 = s.match(/^#([0-9a-f]{6})$/i);
  if (m3) {
    const hex = m3[1];
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  return null;
}

export default function ColorMenu({
  current,
  onMouseDownItem,
  onPick,
}: {
  current: string;
  onMouseDownItem: (e: React.MouseEvent) => void;
  onPick: (cssColor: string) => void;
}) {
  const initial = useMemo(() => {
    const parsed = parseRgb(current);
    if (parsed) return `rgb(${parsed.r}, ${parsed.g}, ${parsed.b})`;
    return 'rgb(0, 0, 0)';
  }, [current]);

  const [value, setValue] = useState(initial);

  useEffect(() => setValue(initial), [initial]);

  const preview = useMemo(() => {
    const parsed = parseRgb(value);
    if (!parsed) return null;
    return `rgb(${parsed.r}, ${parsed.g}, ${parsed.b})`;
  }, [value]);

  return (
    <div className={styles.wrap} onMouseDown={onMouseDownItem}>
      <div className={styles.row}>
        <div className={styles.label}>RGB</div>
        <input
          className={styles.input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="rgb(0, 0, 0) / 0,0,0 / #000000"
        />
      </div>

      <div className={styles.row2}>
        <div className={styles.label}>미리보기</div>
        <div className={styles.preview} style={{ background: preview ?? 'transparent' }} />
        <div className={styles.previewText}>{preview ?? '형식이 올바르지 않음'}</div>
      </div>

      <button
        type="button"
        className={styles.apply}
        disabled={!preview}
        onClick={() => preview && onPick(preview)}
      >
        적용
      </button>
    </div>
  );
}
