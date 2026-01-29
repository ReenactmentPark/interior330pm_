import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_IMAGE_COMMAND } from './ImagesPlugin';

export default function ImageDragDropPastePlugin({
  uploadImage,
}: {
  uploadImage: (file: File) => Promise<string>;
}) {
  const [editor] = useLexicalComposerContext();

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

    // ✅ EventListener 시그니처 유지 (반드시 Event -> void)
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

      void (async () => {
        for (const file of imageFiles) {
          try {
            const url = await uploadImage(file);
            editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: url, altText: file.name });
          } catch (err) {
            console.error('[ImageDragDropPastePlugin] upload failed:', err);
          }
        }
      })();
    }

    function onPaste(e: Event) {
      const ev = e as ClipboardEvent;
      const items = Array.from(ev.clipboardData?.items ?? []);
      const imageItems = items.filter((it) => it.type.startsWith('image/'));
      if (imageItems.length === 0) return;

      ev.preventDefault();
      editor.focus();

      void (async () => {
        for (const it of imageItems) {
          const file = it.getAsFile();
          if (!file) continue;
          try {
            const url = await uploadImage(file);
            editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: url, altText: file.name });
          } catch (err) {
            console.error('[ImageDragDropPastePlugin] upload failed:', err);
          }
        }
      })();
    }
  }, [editor, uploadImage]);

  return null;
}
