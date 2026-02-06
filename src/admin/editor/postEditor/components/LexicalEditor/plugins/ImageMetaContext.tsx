import { createContext, useContext } from 'react';

type ImageMetaContextValue = {
  thumbnailImageUid: string;
  setThumbnailImageUid: (next: string) => void;
};

const ImageMetaContext = createContext<ImageMetaContextValue>({
  thumbnailImageUid: '',
  setThumbnailImageUid: () => {},
});

export function ImageMetaProvider({ value, children }: { value: ImageMetaContextValue; children: React.ReactNode }) {
  return <ImageMetaContext.Provider value={value}>{children}</ImageMetaContext.Provider>;
}

export function useImageMeta() {
  return useContext(ImageMetaContext);
}
