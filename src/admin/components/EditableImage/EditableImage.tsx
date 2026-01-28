import { useRef } from 'react';
import styles from './EditableImage.module.css';
import { useEditMode } from '@/admin/context/EditModeContext';
import { useEditDraft } from '@/admin/context/EditDraftContext';

type Props = {
  id: string;
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  onUpload?: (file: File) => Promise<void>;
};

export default function EditableImage({
  id,
  src,
  alt = '',
  className,
  imgClassName,
  onUpload,
}: Props) {
  const { enabled } = useEditMode();
  const { getImageUrl, setImageFile, resetImage, hasImageDraft } = useEditDraft();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const currentUrl = getImageUrl(id, src);
  const dirty = hasImageDraft(id);

  const openPicker = () => inputRef.current?.click();

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(id, file);
    e.target.value = '';
  };

  const onRevert = () => resetImage(id);

  const onCommit = async () => {
    if (!dirty) return;
    if (onUpload) {
      // 업로드는 추후 DraftContext에 file getter 추가 후 연결
      // 지금은 UI/프리뷰/되돌리기만.
      await onUpload(new File([], 'stub'));
    }
  };

  return (
    <div className={`${styles.wrap} ${className ?? ''} editable-image`}>
      {imgClassName ? <img className={imgClassName} src={currentUrl} alt={alt} /> : null}

      {enabled && (
        <>
          <button
            type="button"
            className={`${styles.overlayBtn} editable-image__overlayBtn`}
            onClick={openPicker}
          >
            이미지 변경
          </button>

          {dirty && (
            <div className={`${styles.actions} editable-image__actions`} aria-label="이미지 수정 액션">
              <button type="button" className={styles.btn} onClick={onCommit}>
                수정 완료
              </button>
              <button type="button" className={styles.btnGhost} onClick={onRevert}>
                되돌리기
              </button>
            </div>
          )}

          <input
            ref={inputRef}
            className={`${styles.file} editable-image__file`}
            type="file"
            accept="image/*"
            onChange={onPick}
          />
        </>
      )}
    </div>
  );
}
