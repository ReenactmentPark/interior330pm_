export type FontKey =
  | 'default'
  | 'BMHANNAPRO'
  | 'Cafe24Danjunghae'
  | 'Cafe24OhsquareAir'
  | 'Cafe24Surround'
  | 'GmarketSansMedium';

export const FONT_OPTIONS: Array<{
  key: FontKey;
  label: string;
  family: string;  // FontFace로 등록할 family 이름
  srcUrl?: string; // 기본서체는 없음, 나머지는 lazy-load
}> = [
  // 기본서체: Pretendard
  { key: 'default', label: '기본서체', family: 'inherit' },
  { key: 'BMHANNAPRO', label: 'BM한나프로', family: 'BMHANNAPRO', srcUrl: '/fonts/BMHANNAPROTF.woff2' },
  { key: 'Cafe24Danjunghae', label: '카페24 단정해', family: 'Cafe24Danjunghae', srcUrl: '/fonts/Cafe24Danjunghae-v2.0.woff2' },
  { key: 'Cafe24OhsquareAir', label: '카페24 오스퀘어 에어', family: 'Cafe24OhsquareAir', srcUrl: '/fonts/Cafe24OhsquareAir-v2.0.woff2' },
  { key: 'Cafe24Surround', label: '카페24 써라운드', family: 'Cafe24Surround', srcUrl: '/fonts/Cafe24Surround-v2.0.woff2' },
  { key: 'GmarketSansMedium', label: 'G마켓 산스(미디움)', family: 'GmarketSansMedium', srcUrl: '/fonts/GmarketSansMedium.woff2' },
];
