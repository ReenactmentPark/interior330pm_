import React, { createContext, useContext } from 'react';

type ThumbnailCtxValue = {
  thumbnailImageUid: string;
  setThumbnailImageUid: (next: string) => void;
};

const ThumbnailContext = createContext<ThumbnailCtxValue | null>(null);

export function ThumbnailProvider({
  value,
  children,
}: {
  value: ThumbnailCtxValue;
  children: React.ReactNode;
}) {
  return <ThumbnailContext.Provider value={value}>{children}</ThumbnailContext.Provider>;
}

export function useThumbnail() {
  const ctx = useContext(ThumbnailContext);
  if (!ctx) {
    // provider 없으면 안전하게 동작 안 하게
    return { thumbnailImageUid: '', setThumbnailImageUid: () => {} };
  }
  return ctx;
}
