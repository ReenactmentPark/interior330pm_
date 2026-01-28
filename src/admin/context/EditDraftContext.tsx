import { createContext, useContext, useMemo, useState } from 'react';

type TextDraftMap = Record<string, string>;
type ImageDraft = { file: File; previewUrl: string };
type ImageDraftMap = Record<string, ImageDraft>;

type EditDraftValue = {
  // text
  getText: (key: string, fallback: string) => string;
  setText: (key: string, next: string) => void;
  resetText: (key: string) => void;
  hasTextDraft: (key: string, fallback: string) => boolean;

  // image
  getImageUrl: (key: string, fallbackUrl: string) => string;
  setImageFile: (key: string, file: File) => void;
  resetImage: (key: string) => void;
  hasImageDraft: (key: string) => boolean;
};

// ✅ Provider 없을 때도 안전하게 동작하는 기본값 (public에서는 항상 이 상태)
const DEFAULT_DRAFT: EditDraftValue = {
  getText: (_key, fallback) => fallback,
  setText: () => {},
  resetText: () => {},
  hasTextDraft: () => false,

  getImageUrl: (_key, fallbackUrl) => fallbackUrl,
  setImageFile: () => {},
  resetImage: () => {},
  hasImageDraft: () => false,
};

const EditDraftContext = createContext<EditDraftValue>(DEFAULT_DRAFT);

export function EditDraftProvider({ children }: { children: React.ReactNode }) {
  const [texts, setTexts] = useState<TextDraftMap>({});
  const [images, setImages] = useState<ImageDraftMap>({});

  const value = useMemo<EditDraftValue>(() => {
    return {
      getText: (key, fallback) => (key in texts ? texts[key] : fallback),
      setText: (key, next) => setTexts((prev) => ({ ...prev, [key]: next })),
      resetText: (key) =>
        setTexts((prev) => {
          const copy = { ...prev };
          delete copy[key];
          return copy;
        }),
      hasTextDraft: (key, fallback) => (key in texts ? texts[key] !== fallback : false),

      getImageUrl: (key, fallbackUrl) => (key in images ? images[key].previewUrl : fallbackUrl),
      setImageFile: (key, file) => {
        const previewUrl = URL.createObjectURL(file);
        setImages((prev) => ({ ...prev, [key]: { file, previewUrl } }));
      },
      resetImage: (key) =>
        setImages((prev) => {
          const copy = { ...prev };
          const cur = copy[key];
          if (cur?.previewUrl) URL.revokeObjectURL(cur.previewUrl);
          delete copy[key];
          return copy;
        }),
      hasImageDraft: (key) => key in images,
    };
  }, [texts, images]);

  return <EditDraftContext.Provider value={value}>{children}</EditDraftContext.Provider>;
}

// ✅ 이제 public에서도 안전 (throw 없음)
export function useEditDraft() {
  return useContext(EditDraftContext);
}
