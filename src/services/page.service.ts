import type { HomeApiResponse } from '@/types/page';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}
function isString(v: unknown): v is string {
  return typeof v === 'string';
}
function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}
function isNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function assertImageAsset(v: unknown, fieldName: string): asserts v is { url: string; alt?: string | null } {
  if (!isRecord(v)) throw new Error(`Invalid ${fieldName}`);
  if (!isNonEmptyString((v as any).url)) throw new Error(`Invalid ${fieldName}.url`);
  if ((v as any).alt != null && !isString((v as any).alt)) throw new Error(`Invalid ${fieldName}.alt`);
}

function assertTextBlock(
  v: unknown,
  fieldName: string
): asserts v is { title: string; highlight?: string | null; highlightColor?: string | null; description?: string } {
  if (!isRecord(v)) throw new Error(`Invalid ${fieldName}`);
  if (!isNonEmptyString((v as any).title)) throw new Error(`Invalid ${fieldName}.title`);

  const highlight = (v as any).highlight;
  const highlightColor = (v as any).highlightColor;

  // ✅ null 허용 / ""도 허용(정규화는 VM에서)
  if (highlight != null && !isString(highlight)) throw new Error(`Invalid ${fieldName}.highlight`);
  if (highlightColor != null && !isString(highlightColor)) throw new Error(`Invalid ${fieldName}.highlightColor`);

  // galleryText에만 description이 필수일 수 있음(여기선 있으면 검사)
  if ((v as any).description != null && !isString((v as any).description)) {
    throw new Error(`Invalid ${fieldName}.description`);
  }
}

export function assertHomeApiResponse(data: unknown): asserts data is HomeApiResponse {
  if (!isRecord(data)) throw new Error('Invalid home payload');

  if ((data as any).page !== 'home') throw new Error('Invalid page');
  if (!isNumber((data as any).version)) throw new Error('Invalid version');
  if (!isNonEmptyString((data as any).updatedAt)) throw new Error('Invalid updatedAt');

  const sections = (data as any).sections;
  if (!isRecord(sections)) throw new Error('Invalid sections');

  // images
  if (!isRecord(sections.images)) throw new Error('Invalid sections.images');
  assertImageAsset(sections.images.hero, 'sections.images.hero');

  const cards = sections.images.cards;
  if (!Array.isArray(cards)) throw new Error('Invalid sections.images.cards');
  if (cards.length < 4) throw new Error('sections.images.cards must have at least 4 items');
  cards.forEach((c: unknown, idx: number) => assertImageAsset(c, `sections.images.cards[${idx}]`));

  // ✅ heroText / galleryText
  assertTextBlock(sections.heroText, 'sections.heroText');
  assertTextBlock(sections.galleryText, 'sections.galleryText');

  if (!isNonEmptyString((sections.galleryText as any).description)) {
    throw new Error('Invalid sections.galleryText.description');
  }

  // cta
  if (!isRecord(sections.cta)) throw new Error('Invalid sections.cta');
  if (sections.cta.background != null) {
    assertImageAsset(sections.cta.background, 'sections.cta.background');
  }
  if (!isNonEmptyString(sections.cta.title)) throw new Error('Invalid sections.cta.title');
  if (!isNonEmptyString(sections.cta.description)) throw new Error('Invalid sections.cta.description');

  if (!isRecord(sections.cta.button)) throw new Error('Invalid sections.cta.button');
  if (!isNonEmptyString(sections.cta.button.label)) throw new Error('Invalid sections.cta.button.label');
  if (!isNonEmptyString(sections.cta.button.to)) throw new Error('Invalid sections.cta.button.to');

  // ✅ footer (optional) — 기존 코드가 data.footer를 보고 있어서 버그였음 → sections.footer로 수정
  if (sections.footer != null) {
    const footer = sections.footer;
    if (!isRecord(footer)) throw new Error('Invalid sections.footer');

    const leftLines = (footer as any).leftLines;
    if (!Array.isArray(leftLines) || leftLines.some((x: unknown) => !isNonEmptyString(x))) {
      throw new Error('Invalid sections.footer.leftLines');
    }

    const rightLinks = (footer as any).rightLinks;
    if (!Array.isArray(rightLinks)) throw new Error('Invalid sections.footer.rightLinks');
    rightLinks.forEach((l: unknown, idx: number) => {
      if (!isRecord(l)) throw new Error(`Invalid sections.footer.rightLinks[${idx}]`);
      if (!isNonEmptyString((l as any).label)) throw new Error(`Invalid sections.footer.rightLinks[${idx}].label`);
      if (!isNonEmptyString((l as any).href)) throw new Error(`Invalid sections.footer.rightLinks[${idx}].href`);
    });

    if (!isNonEmptyString((footer as any).copyright)) {
      throw new Error('Invalid sections.footer.copyright');
    }
  }
}

export async function getHomePage(_signal?: AbortSignal): Promise<HomeApiResponse> {
  const module = await import('@/example.json');
  const data = module.default as unknown;
  assertHomeApiResponse(data);
  return data;
}


///////////////////////////
// Interior Page Types ////
///////////////////////////

import type { InteriorApiResponse } from '@/types/page';

// ✅ 로컬 mock(json)로 우선 연결 (나중에 API로 바꿀 때 여기만 수정)
export async function getInteriorPage(signal?: AbortSignal): Promise<InteriorApiResponse> {
  const mod = await import('@/data/interior.example.json');
  const data = mod.default as InteriorApiResponse;

  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  return data;
}

///////////////////////////
// Furniture Page Types ///
///////////////////////////

import furniture from '@/data/furniture.example.json';
import type { FurnitureApiResponse } from '@/types/page';

export async function getFurniturePage(_signal?: AbortSignal): Promise<FurnitureApiResponse> {
  // signal은 동일 시그니처 유지용 (현재는 로컬 import라 미사용)
  return furniture as FurnitureApiResponse;
}