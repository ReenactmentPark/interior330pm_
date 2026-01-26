export type HomeImagesData = {
  hero: string;      // 상단 풀 이미지 URL
  cards: string[];   // 카드 4장 URL (length 4 권장)
};

export type HomeCtaData = {
  backgroundImageUrl?: string; // CTA 배경 이미지 URL
  title: string;
  description: string;         // 줄바꿈은 \n 허용
  buttonLabel: string;
  buttonTo: string;            // 라우트 경로 (예: /inquiry)
};