import * as React from 'react';
import styles from '../EditorToolbar.module.css';
import { loadFontOnce } from '@/utils/fontLoader';
import { FONT_OPTIONS, FONT_DEFS, fontCssToLabel } from '../constants/fonts';

type Props = {
  current: string;
  onMouseDownItem: (e: React.MouseEvent<Element>) => void;
  onPick: (label: (typeof FONT_OPTIONS)[number]) => void;
};

function familyToCss(family: string) {
  const f = (family || '').trim();
  if (!f) return 'inherit';
  const first = f.includes(' ') ? `"${f}"` : f;
  return `${first}, Pretendard, "Pretendard Variable", system-ui, -apple-system, "Noto Sans KR", sans-serif`;
}

export default function FontMenu({ current, onMouseDownItem, onPick }: Props) {
  const currentLabel = fontCssToLabel(current);

  // ✅ 메뉴 열릴 때 프리로드(프리뷰 폰트가 바로 보이게)
  React.useEffect(() => {
    void Promise.all(
      FONT_OPTIONS.map(async (label) => {
        const def = FONT_DEFS[label];
        if (!def?.srcUrl || def.family === 'inherit') return;
        await loadFontOnce({
          family: def.family,
          srcUrl: def.srcUrl,
          descriptors: { style: 'normal', weight: '400' },
        });
      })
    ).catch(() => {});
  }, []);

  return (
    <div className={styles.menuList}>
      {FONT_OPTIONS.map((label) => {
        const active = currentLabel === label;
        const def = FONT_DEFS[label];
        const previewCss = def?.family === 'inherit' ? 'inherit' : familyToCss(def?.family ?? '');

        return (
          <button
            key={label}
            type="button"
            className={styles.menuItem}
            onMouseDown={onMouseDownItem}
            onClick={() => onPick(label)}
          >
            <span className={styles.check}>{active ? '✓' : ''}</span>
            <span className={styles.itemText} style={{ fontFamily: previewCss }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
