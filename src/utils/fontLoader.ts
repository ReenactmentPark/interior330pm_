// src/utils/fontLoader.ts
type LoadFontArgs = {
  family: string;
  srcUrl: string; // "/fonts/xxx.woff2"
  descriptors?: FontFaceDescriptors;
};

const loaded = new Set<string>();

function keyOf({ family, srcUrl, descriptors }: LoadFontArgs) {
  const w = descriptors?.weight ?? 'normal';
  const s = descriptors?.style ?? 'normal';
  const st = descriptors?.stretch ?? 'normal';
  return `${family}__${srcUrl}__${w}__${s}__${st}`;
}

function injectFontFaceCSS(family: string, srcUrl: string, descriptors?: FontFaceDescriptors) {
  const id = `ff_${family}_${srcUrl}`.replace(/[^a-z0-9_]/gi, '_');
  if (document.getElementById(id)) return;

  const weight = descriptors?.weight ?? '400';
  const style = descriptors?.style ?? 'normal';

  const styleEl = document.createElement('style');
  styleEl.id = id;
  styleEl.textContent = `
@font-face {
  font-family: "${family}";
  src: url("${srcUrl}") format("woff2");
  font-weight: ${weight};
  font-style: ${style};
  font-display: swap;
}`;
  document.head.appendChild(styleEl);
}

export async function loadFontOnce(args: LoadFontArgs): Promise<void> {
  const family = (args.family || '').trim();
  const srcUrl = (args.srcUrl || '').trim();
  if (!family || !srcUrl) return;

  const k = keyOf(args);
  if (loaded.has(k)) return;

  try {
    // ✅ 1) FontFace API로 “강제 로드” (요청이 여기서 떠야 정상)
    const face = new FontFace(
      family,
      `url(${srcUrl}) format("woff2")`,
      args.descriptors
    );

    await face.load(); // ✅ 여기서 네트워크 요청 발생
    document.fonts.add(face);

    loaded.add(k);
    return;
  } catch (e) {
    // ✅ 2) 실패하면 @font-face CSS 삽입 fallback
    injectFontFaceCSS(family, srcUrl, args.descriptors);
    loaded.add(k);
  }
}
