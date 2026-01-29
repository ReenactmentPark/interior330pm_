import styles from '../EditorToolbar.module.css';

type Props = {
  onClickImage: () => void;
  onMouseDownItem: (e: React.MouseEvent) => void;
};

export default function ImageMenu({ onClickImage, onMouseDownItem }: Props) {
  return (
    <>
      <div className={styles.menuTitle}>사진</div>
      <button className={styles.menuItemSingle} type="button" onMouseDown={onMouseDownItem} onClick={onClickImage}>
        (다음 단계) 업로드/드래그드롭
      </button>
    </>
  );
}
