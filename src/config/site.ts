// src/config/site.ts
export type SiteFooterConfig = {
  leftLines: string[];
  rightLinks: { label: string; href: string }[];
  copyright: string;
};

export const siteFooter: SiteFooterConfig = {
  leftLines: [
    '47582 부산시 연제구 쌍미천로 104',
    '박재우 | 010-8557-2222 | 000-00-00000 | 제0000-부산-0000호',
  ],
  rightLinks: [
    { label: 'Instagram', href: 'https://instagram.com/' },
    { label: 'Kakaotalk', href: 'https://open.kakao.com/' },
  ],
  copyright: '©330pm All Rights Reserved.',
};
