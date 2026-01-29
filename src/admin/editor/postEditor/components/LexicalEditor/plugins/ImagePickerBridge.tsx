import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_IMAGE_COMMAND } from './ImagesPlugin';

/**
 * ✅ 카메라 클릭 -> "홈 이미지 변경"과 동일한 picker/저장소 UI를 띄우는 브릿지
 *
 * 이 컴포넌트는 "외부 picker 함수"를 주입받는다.
 * - pickImage(): Promise<string | null>
 *   -> 선택 취소면 null
 *   -> 선택 완료면 이미지 URL
 */
export default function ImagePickerBridge({
  requestSignal,
  pickImage,
}: {
  /** 부모에서 증가시키는 트리거(카메라 클릭 시 +1) */
  requestSignal: number;
  pickImage: () => Promise<string | null>;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (requestSignal <= 0) return;
      const url = await pickImage();
      if (cancelled) return;
      if (!url) return;

      editor.focus();
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: url, altText: '' });
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [editor, requestSignal, pickImage]);

  return null;
}
