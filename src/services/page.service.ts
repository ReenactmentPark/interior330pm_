import type { HomeApiResponse } from '@/types/page';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}
function isString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}
function isNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function assertImageAsset(v: unknown, fieldName: string): asserts v is { url: string; alt?: string } {
  if (!isRecord(v)) throw new Error(`Invalid ${fieldName}`);
  if (!isString(v.url)) throw new Error(`Invalid ${fieldName}.url`);
  if (v.alt != null && !isString(v.alt)) throw new Error(`Invalid ${fieldName}.alt`);
}

export function assertHomeApiResponse(data: unknown): asserts data is HomeApiResponse {
  if (!isRecord(data)) throw new Error('Invalid home payload');

  if (data.page !== 'home') throw new Error('Invalid page');
  if (!isNumber(data.version)) throw new Error('Invalid version');
  if (!isString(data.updatedAt)) throw new Error('Invalid updatedAt');

  if (!isRecord(data.sections)) throw new Error('Invalid sections');

  // images
  if (!isRecord(data.sections.images)) throw new Error('Invalid sections.images');
  assertImageAsset(data.sections.images.hero, 'sections.images.hero');

  const cards = (data.sections.images as any).cards;
  if (!Array.isArray(cards)) throw new Error('Invalid sections.images.cards');
  if (cards.length < 4) throw new Error('sections.images.cards must have at least 4 items');
  cards.forEach((c: unknown, idx: number) => assertImageAsset(c, `sections.images.cards[${idx}]`));

  // cardText
  if (!isRecord(data.sections.cardText)) throw new Error('Invalid sections.cardText');
  if (!isString(data.sections.cardText.title)) throw new Error('Invalid sections.cardText.title');
  if (!isString(data.sections.cardText.description)) throw new Error('Invalid sections.cardText.description');
  if (data.sections.cardText.highlight != null && !isString(data.sections.cardText.highlight)) {
    throw new Error('Invalid sections.cardText.highlight');
  }
  if (data.sections.cardText.highlightColor != null && !isString(data.sections.cardText.highlightColor)) {
    throw new Error('Invalid sections.cardText.highlightColor');
  }

  // cta
  if (!isRecord(data.sections.cta)) throw new Error('Invalid sections.cta');
  if (data.sections.cta.background != null) {
    assertImageAsset(data.sections.cta.background, 'sections.cta.background');
  }
  if (!isString(data.sections.cta.title)) throw new Error('Invalid sections.cta.title');
  if (!isString(data.sections.cta.description)) throw new Error('Invalid sections.cta.description');

  if (!isRecord(data.sections.cta.button)) throw new Error('Invalid sections.cta.button');
  if (!isString(data.sections.cta.button.label)) throw new Error('Invalid sections.cta.button.label');
  if (!isString(data.sections.cta.button.to)) throw new Error('Invalid sections.cta.button.to');

  // footer (optional)
  if ((data as any).footer != null) {
    const footer = (data as any).footer;
    if (!isRecord(footer)) throw new Error('Invalid footer');

    const leftLines = footer.leftLines;
    if (!Array.isArray(leftLines) || leftLines.some((x: unknown) => !isString(x))) {
      throw new Error('Invalid footer.leftLines');
    }

    const rightLinks = footer.rightLinks;
    if (!Array.isArray(rightLinks)) throw new Error('Invalid footer.rightLinks');
    rightLinks.forEach((l: unknown, idx: number) => {
      if (!isRecord(l)) throw new Error(`Invalid footer.rightLinks[${idx}]`);
      if (!isString((l as any).label)) throw new Error(`Invalid footer.rightLinks[${idx}].label`);
      if (!isString((l as any).href)) throw new Error(`Invalid footer.rightLinks[${idx}].href`);
    });

    if (!isString(footer.copyright)) {
      throw new Error('Invalid footer.copyright');
    }
  }
}

export async function getHomePage(_signal?: AbortSignal): Promise<HomeApiResponse> {
  const module = await import('@/example.json');
  const data = module.default as unknown;
  assertHomeApiResponse(data);
  return data;
}
