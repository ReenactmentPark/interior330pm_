import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_IMAGE_COMMAND } from './ImagesPlugin';
import { useThumbnail } from '../thumbnailContext';


export default function ImageDragDropPastePlugin({
  registerLocalImage,
}: {
  registerLocalImage: (file: File) => { imageUid: string; src: string };
}) {
  const [editor] = useLexicalComposerContext();
  const { thumbnailImageUid, setThumbnailImageUid } = useThumbnail();
  const thumbRef = useRef(thumbnailImageUid);
  useEffect(() => {
    thumbRef.current = thumbnailImageUid;
  }, [thumbnailImageUid]);

  useEffect(() => {
    const cleanup = editor.registerRootListener((rootElement, prevRootElement) => {
      if (prevRootElement) {
        prevRootElement.removeEventListener('dragover', onDragOver);
        prevRootElement.removeEventListener('drop', onDrop);
        prevRootElement.removeEventListener('paste', onPaste);
      }

      if (!rootElement) return;

      rootElement.addEventListener('dragover', onDragOver);
      rootElement.addEventListener('drop', onDrop);
      rootElement.addEventListener('paste', onPaste);
    });

    return cleanup;

    function onDragOver(e: Event) {
      const ev = e as DragEvent;
      if (!ev.dataTransfer) return;
      if (Array.from(ev.dataTransfer.types).includes('Files')) {
        ev.preventDefault();
      }
    }

    function onDrop(e: Event) {
      const ev = e as DragEvent;
      if (!ev.dataTransfer) return;

      const files = Array.from(ev.dataTransfer.files ?? []);
      const imageFiles = files.filter((f) => f.type.startsWith('image/'));
      if (imageFiles.length === 0) return;

      ev.preventDefault();
      editor.focus();

      for (const file of imageFiles) {
        const { imageUid, src } = registerLocalImage(file);
        if (!thumbRef.current) setThumbnailImageUid(imageUid);
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, { imageUid, src, altText: file.name });
      }
    }

    function onPaste(e: Event) {
      const ev = e as ClipboardEvent;
      const items = Array.from(ev.clipboardData?.items ?? []);
      const imageItems = items.filter((it) => it.type.startsWith('image/'));
      if (imageItems.length === 0) return;

      ev.preventDefault();
      editor.focus();

      for (const it of imageItems) {
        const file = it.getAsFile();
        if (!file) continue;
        const { imageUid, src } = registerLocalImage(file);
        if (!thumbRef.current) setThumbnailImageUid(imageUid);
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, { imageUid, src, altText: file.name });
      }
    }
  }, [editor, registerLocalImage]);

  return null;
}
