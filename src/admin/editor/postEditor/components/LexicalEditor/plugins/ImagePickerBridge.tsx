import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_IMAGE_COMMAND } from './ImagesPlugin';

export default function ImagePickerBridge({
  requestSignal,
  pickImage,
}: {
  requestSignal: number;
  pickImage: () => Promise<{ imageUid: string; src: string } | null>;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (requestSignal <= 0) return;
      const picked = await pickImage();
      if (cancelled) return;
      if (!picked) return;

      editor.focus();
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, { imageUid: picked.imageUid, src: picked.src, altText: '' });
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [editor, requestSignal, pickImage]);

  return null;
}
