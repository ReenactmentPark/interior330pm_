import { useRef, useState } from 'react';
import styles from './EditorToolbar.module.css';

import imageIcon from '@/assets/icons/image.svg';
import rgbIcon from '@/assets/icons/rgb.svg';
import alignLeftIcon from '@/assets/icons/align-left.svg';
import alignCenterIcon from '@/assets/icons/align-center.svg';
import alignRightIcon from '@/assets/icons/align-right.svg';

import OverlayMenu from './overlay/OverlayMenu';
import FontMenu from './menus/FontMenu';
import SizeMenu from './menus/SizeMenu';
import AlignMenu from './menus/AlignMenu';
import ColorMenu from './menus/ColorMenu';

import { loadFontOnce } from '@/utils/fontLoader';
import { FONT_OPTIONS, FONT_DEFS, fontCssToLabel } from './constants/fonts';

export type TextAlign = 'left' | 'center' | 'right';

type Props = {
  fontLabel: string;
  sizeLabel: number;
  isBold: boolean;
  colorLabel: string;
  align: TextAlign;

  onPickFont: (font: string) => void;
  onPickSize: (size: number) => void;
  onToggleBold: () => void;
  onPickColor: (cssColor: string) => void;
  onPickAlign: (align: TextAlign) => void;

  // ✅ 카메라 클릭 = 바로 파일저장소
  onClickImage: () => void;
};

type MenuKind = 'font' | 'size' | 'align' | 'color' | null;

export default function EditorToolbar({
  fontLabel,
  sizeLabel,
  isBold,
  align,
  colorLabel,
  onPickFont,
  onPickSize,
  onToggleBold,
  onPickColor,
  onPickAlign,
  onClickImage,
}: Props) {
  const [openMenu, setOpenMenu] = useState<MenuKind>(null);
  const anchors = useRef<Record<string, HTMLButtonElement | null>>({});

  const setAnchor = (key: string) => (el: HTMLButtonElement | null) => {
    anchors.current[key] = el;
  };

  const close = () => setOpenMenu(null);

  const preventFocusSteal = (e: React.MouseEvent) => {
    // ✅ selection 유지(에디터 포커스/커서 안 깨짐)
    e.preventDefault();
  };

  const alignIcon =
    align === 'center' ? alignCenterIcon : align === 'right' ? alignRightIcon : alignLeftIcon;

  async function applyFontByLabel(label: (typeof FONT_OPTIONS)[number]) {
    const def = FONT_DEFS[label];
    if (!def) return;

    // ✅ 1) 먼저 Lexical에 적용 (selection 살아있을 때)
    // 기본서체면 ''로 보내서 font-family 제거
    const family = def.family === 'inherit' ? '' : def.family;
    onPickFont(family);

    // ✅ 2) 폰트 로딩은 뒤에서 비동기로 (요청 발생)
    if (def.srcUrl && def.family !== 'inherit') {
      void loadFontOnce({
        family: def.family,
        srcUrl: def.srcUrl,
        descriptors: { style: 'normal', weight: '400' },
      }).catch(() => {});
    }
  }

  return (
    <div className={styles.bar} aria-label="본문 편집 툴바">
      {/* ================== 이미지(카메라) ================== */}
      <button
        className={styles.iconBtn}
        type="button"
        onMouseDown={preventFocusSteal}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClickImage(); // ✅ 팝오버 없이 바로 파일 저장소
        }}
        aria-label="이미지 삽입"
        title="이미지 삽입"
      >
        <img className={styles.icon} src={imageIcon} alt="" />
      </button>

      {/* ================== 서체 ================== */}
      <button
        ref={setAnchor('font')}
        className={styles.selectBtn}
        type="button"
        onMouseDown={preventFocusSteal}
        onClick={() => setOpenMenu((p) => (p === 'font' ? null : 'font'))}
        aria-label="서체"
        title="서체"
      >
        <span className={styles.selectText}>{fontCssToLabel(fontLabel)}</span>
        <span className={styles.caret} aria-hidden />
      </button>

      {/* ================== 글자 크기 ================== */}
      <button
        ref={setAnchor('size')}
        className={styles.selectBtn}
        type="button"
        onMouseDown={preventFocusSteal}
        onClick={() => setOpenMenu((p) => (p === 'size' ? null : 'size'))}
        aria-label="글자 크기"
        title="글자 크기"
      >
        <span className={styles.selectText}>{sizeLabel}</span>
        <span className={styles.caret} aria-hidden />
      </button>

      {/* ================== Bold ================== */}
      <button
        className={`${styles.boldBtn} ${isBold ? styles.boldOn : ''}`}
        type="button"
        onMouseDown={preventFocusSteal}
        onClick={(e) => {
          e.preventDefault();
          onToggleBold();
        }}
        aria-label="굵게"
        title="굵게"
      >
        B
      </button>

      {/* ================== 글자색(RGB) ================== */}
      <button
        ref={setAnchor('color')}
        className={styles.iconBtn}
        type="button"
        onMouseDown={preventFocusSteal}
        onClick={() => setOpenMenu((p) => (p === 'color' ? null : 'color'))}
        aria-label="글자색"
        title="글자색"
      >
        <img className={styles.icon} src={rgbIcon} alt="" />
      </button>    

      {/* ================== 정렬 ================== */}
      <button
        ref={setAnchor('align')}
        className={styles.iconBtn}
        type="button"
        onMouseDown={preventFocusSteal}
        onClick={() => setOpenMenu((p) => (p === 'align' ? null : 'align'))}
        aria-label="정렬"
        title="정렬"
      >
        <img className={styles.icon} src={alignIcon} alt="" />
      </button>

      {/* ================== Overlay Menus ================== */}
      <OverlayMenu open={openMenu === 'font'} anchorEl={anchors.current.font} onClose={close} width={220}>
        <FontMenu
          current={fontLabel}
          onMouseDownItem={preventFocusSteal}
          onPick={async (label) => {
            await applyFontByLabel(label);
            close();
          }}
        />
      </OverlayMenu>

      <OverlayMenu open={openMenu === 'size'} anchorEl={anchors.current.size} onClose={close} width={115}>
        <SizeMenu
          current={sizeLabel}
          onMouseDownItem={preventFocusSteal}
          onPick={(sz) => {
            onPickSize(sz);
            close();
          }}
        />
      </OverlayMenu>

      <OverlayMenu open={openMenu === 'color'} anchorEl={anchors.current.color} onClose={close} width={290}>
        <ColorMenu
          current={colorLabel}
          onMouseDownItem={preventFocusSteal}
          onPick={(c) => {
            onPickColor(c);
            close();
          }}
        />
      </OverlayMenu>

      <OverlayMenu open={openMenu === 'align'} anchorEl={anchors.current.align} onClose={close} width={130}>
        <AlignMenu
          current={align}
          onMouseDownItem={preventFocusSteal}
          onPick={(a) => {
            onPickAlign(a);
            close();
          }}
        />
      </OverlayMenu>
    </div>
  );
}
