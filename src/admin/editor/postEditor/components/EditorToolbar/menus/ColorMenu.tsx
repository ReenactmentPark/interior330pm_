import * as React from 'react';
import { HexColorPicker } from 'react-colorful';
import styles from '../EditorToolbar.module.css';

function clampByte(n: number) {
  return Math.max(0, Math.min(255, n | 0));
}

function rgbToCss(r: number, g: number, b: number) {
  return `rgb(${clampByte(r)}, ${clampByte(g)}, ${clampByte(b)})`;
}

function rgbToHex(r: number, g: number, b: number) {
  const to2 = (v: number) => clampByte(v).toString(16).padStart(2, '0');
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '').trim();
  const normalized =
    h.length === 3
      ? `${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`
      : h.padEnd(6, '0').slice(0, 6);

  const r = clampByte(parseInt(normalized.slice(0, 2), 16));
  const g = clampByte(parseInt(normalized.slice(2, 4), 16));
  const b = clampByte(parseInt(normalized.slice(4, 6), 16));
  return { r, g, b };
}

// rgb(0,0,0) / 0,0,0 / 0 0 0 / #000000
function parseColorInput(input: string): { r: number; g: number; b: number } | null {
  const raw = input.trim();

  if (!raw) return null;

  if (raw.startsWith('#')) {
    return hexToRgb(raw);
  }

  const cleaned = raw
    .replace(/^rgb\s*\(/i, '')
    .replace(/\)\s*$/i, '')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const parts = cleaned.split(' ');
  if (parts.length < 3) return null;

  const r = Number(parts[0]);
  const g = Number(parts[1]);
  const b = Number(parts[2]);
  if (![r, g, b].every((n) => Number.isFinite(n))) return null;

  return { r: clampByte(r), g: clampByte(g), b: clampByte(b) };
}

type Props = {
  /** 예: "rgb(111, 101, 58)" */
  current: string;

  /** selection 유지용: Toolbar의 preventFocusSteal 그대로 전달 */
  onMouseDownItem: (e: React.MouseEvent<Element>) => void;

  /** 적용 버튼 눌렀을 때 부모로 올릴 값 */
  onPick: (cssColor: string) => void;
};

export default function ColorMenu({ current, onMouseDownItem, onPick }: Props) {
  // current를 초기값으로 파싱. 실패하면 검정.
  const initial = React.useMemo(() => parseColorInput(current) ?? { r: 0, g: 0, b: 0 }, [current]);

  const [rgb, setRgb] = React.useState(initial);
  const [input, setInput] = React.useState(rgbToCss(initial.r, initial.g, initial.b));
  const [invalid, setInvalid] = React.useState(false);

  // current가 바뀌면(외부 상태 변경) 메뉴 내부도 따라가게
  React.useEffect(() => {
    const next = parseColorInput(current);
    if (!next) return;
    setRgb(next);
    setInput(rgbToCss(next.r, next.g, next.b));
    setInvalid(false);
  }, [current]);

  const hex = React.useMemo(() => rgbToHex(rgb.r, rgb.g, rgb.b), [rgb.r, rgb.g, rgb.b]);
  const previewCss = React.useMemo(() => rgbToCss(rgb.r, rgb.g, rgb.b), [rgb.r, rgb.g, rgb.b]);

  const commitInput = React.useCallback(() => {
    const parsed = parseColorInput(input);
    if (!parsed) {
      setInvalid(true);
      return;
    }
    setRgb(parsed);
    setInput(rgbToCss(parsed.r, parsed.g, parsed.b));
    setInvalid(false);
  }, [input]);

  const onInputKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitInput();
      }
    },
    [commitInput]
  );

  const onPickHex = React.useCallback((nextHex: string) => {
    const next = hexToRgb(nextHex);
    setRgb(next);
    setInput(rgbToCss(next.r, next.g, next.b));
    setInvalid(false);
  }, []);

  const apply = React.useCallback(() => {
    if (invalid) return;
    // 입력이 수정중이었으면 한번 확정
    commitInput();
    // commitInput이 성공하면 rgb가 세팅되지만 setState 비동기라
    // 여기서는 현재 previewCss 기준으로 올리는 게 안정적임.
    onPick(previewCss);
  }, [invalid, commitInput, onPick, previewCss]);

  return (
    <div className={styles.colorMenu} onMouseDown={onMouseDownItem}>
      <div className={styles.colorRow}>
        <div className={styles.colorLabel}>RGB</div>
        <input
          className={styles.colorInput}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={commitInput}
          onKeyDown={onInputKeyDown}
          spellCheck={false}
          style={invalid ? { borderColor: 'rgba(255,0,0,0.45)' } : undefined}
        />
      </div>

      {/* 색표 */}
      <div className={styles.colorPickerWrap} onMouseDown={onMouseDownItem}>
        <HexColorPicker color={hex} onChange={onPickHex} />
      </div>

      <div className={styles.colorRow2}>
        <div className={styles.colorLabel}>미리보기</div>
        <div className={styles.colorPreview} style={{ background: previewCss }} />
        <div className={styles.colorPreviewText}>{previewCss}</div>
      </div>

      <button
        type="button"
        className={styles.colorApply}
        onMouseDown={onMouseDownItem}
        onClick={apply}
        disabled={invalid}
      >
        적용
      </button>
    </div>
  );
}
