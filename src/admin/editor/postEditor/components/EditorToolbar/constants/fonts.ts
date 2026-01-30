// src/admin/editor/constants/fonts.ts

export const FONT_OPTIONS: string[] = [
  '기본서체',
  'BM한나프로',
  '카페24 단정해',
  '카페24 오스퀘어 에어',
  '카페24 써라운드',
  'G마켓 산스(미디움)',
];

// 폰트 정의(라벨 -> 실제 family/srcUrl)
// family는 FontFace에 등록되는 이름(네가 정하는 값)
// srcUrl은 public/fonts 기준
export const FONT_DEFS: Record<
  (typeof FONT_OPTIONS)[number],
  { family: string; srcUrl?: string }
> = {
  기본서체: { family: 'inherit' },

  'BM한나프로': { family: 'BMHANNAPRO', srcUrl: '/fonts/BMHANNAPROTF.woff2' },
  '카페24 단정해': { family: 'Cafe24Danjunghae', srcUrl: '/fonts/Cafe24Danjunghae-v2.0.woff2' },
  '카페24 오스퀘어 에어': { family: 'Cafe24OhsquareAir', srcUrl: '/fonts/Cafe24OhsquareAir-v2.0.woff2' },
  '카페24 써라운드': { family: 'Cafe24Surround', srcUrl: '/fonts/Cafe24Surround-v2.0.woff2' },
  'G마켓 산스(미디움)': { family: 'GmarketSansMedium', srcUrl: '/fonts/GmarketSansMedium.woff2' },
};

// 라벨 -> 실제 font-family css 문자열(적용용)
export function fontLabelToCss(label: (typeof FONT_OPTIONS)[number]) {
  const def = FONT_DEFS[label];
  if (!def) return 'inherit';

  if (def.family === 'inherit') return 'inherit';

  return `"${def.family}", Pretendard, "Pretendard Variable", system-ui, -apple-system, "Noto Sans KR", sans-serif`;
}

// 현재 css 문자열(툴바에 들어온 값) -> 라벨(표시용)
// 지금 너는 fontLabel에 css 문자열이 들어오니까, UI에서 라벨로 되돌리는 용도.
export function fontCssToLabel(css: string) {
  const v = (css || '').trim();
  if (!v || v === 'inherit') return '기본서체';

  // css 안에 family 이름이 포함되어 있으면 매칭
  for (const label of FONT_OPTIONS) {
    const def = FONT_DEFS[label];
    if (!def?.family || def.family === 'inherit') continue;
    if (v.includes(def.family)) return label;
  }
  return '기본서체';
}

export function fontLabelToFamily(label: (typeof FONT_OPTIONS)[number]) {
  const def = FONT_DEFS[label];
  if (!def) return '';
  return def.family === 'inherit' ? '' : def.family; // ✅ 단일 family만
}

export function familyToCss(family: string) {
  const f = (family || '').trim();
  if (!f) return 'inherit';
  const first = f.includes(' ') ? `"${f}"` : f;
  return `${first}, Pretendard, "Pretendard Variable", system-ui, -apple-system, "Noto Sans KR", sans-serif`;
}
