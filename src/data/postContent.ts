// src/data/postContent.ts
export type PostBlock =
  | { type: 'heading'; text: string; level?: 2 | 3 }
  | { type: 'paragraph'; text: string }
  | { type: 'image'; url: string; alt?: string }
  | { type: 'link'; href: string; label: string }
  | { type: 'quote'; text: string };

type PostKey = `interior:${string}` | `furniture:${string}`;

const FALLBACK: PostBlock[] = [
  { type: 'paragraph', text: '게시글 내용을 준비 중입니다.' },
];

const POSTS: Record<PostKey, PostBlock[]> = {
  // 예시 (원하면 나중에 admin에서 저장/불러오기 붙이면 됨)
  'interior:p1': [
    { type: 'heading', text: '프로젝트 개요', level: 2 },
    {
      type: 'paragraph',
      text: '공간의 동선과 조도를 우선으로 설계하고, 마감은 톤 다운된 우드 텍스처로 정리했습니다.',
    },
    {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?q=80&w=1800&auto=format&fit=crop',
      alt: '프로젝트 이미지',
    },
    { type: 'heading', text: '디테일', level: 2 },
    { type: 'quote', text: '과한 장식보다 “완성도”로 승부한다.' },
    {
      type: 'link',
      href: 'https://www.piku.co.kr/',
      label: '참고 링크(예시)',
    },
  ],
};

export function getPostBlocks(kind: 'interior' | 'furniture', id: string): PostBlock[] {
  return POSTS[`${kind}:${id}` as PostKey] ?? FALLBACK;
}
