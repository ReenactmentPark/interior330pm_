import { Link } from 'react-router-dom';
import { useState } from 'react';
import styles from './FurnitureThumbSection.module.css';
import { toSafeUrl } from '@/utils/safeUrl';
import type { FurnitureProject } from '@/types/page';
import { useEditMode } from '@/admin/context/EditModeContext';
import ConfirmDeleteModal from '@/components/common/ConfirmDeleteModal/ConfirmDeleteModal';

type Props = {
  projects: FurnitureProject[];
  onDelete?: (id: string) => void;
};

export default function FurnitureThumbSection({ projects, onDelete }: Props) {
  const { enabled } = useEditMode();
  const canDelete = enabled && typeof onDelete === 'function';

  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<FurnitureProject | null>(null);

  const askDelete = (p: FurnitureProject) => {
    setTarget(p);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setTarget(null);
  };

  const confirm = () => {
    if (target) onDelete?.(target.id);
    close();
  };

  return (
    <>
      <div className={styles.grid} aria-label="가구제작 썸네일">
        {projects.map((p) => {
          const src = toSafeUrl(p.thumbnailUrl);

          return (
            <Link key={p.id} to={p.to} className={styles.cardLink} aria-label={`${p.title} 이동`}>
              <article className={styles.card}>
                <div className={styles.thumb}>
                  {src ? <img src={src} alt={p.title} loading="lazy" /> : <div className={styles.thumbFallback} />}
                </div>

                {/* ✅ admin delete "-" */}
                {canDelete && (
                  <button
                    className={styles.deleteBtn}
                    type="button"
                    aria-label="게시글 삭제"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      askDelete(p);
                    }}
                  />
                )}

                <div className={styles.textBlock}>
                  <h3 className={styles.cardTitle}>{p.title}</h3>
                  <p className={styles.cardMeta}>{p.period}</p>
                </div>
              </article>
            </Link>
          );
        })}
      </div>

      <ConfirmDeleteModal open={open} title={target?.title ?? ''} onConfirm={confirm} onClose={close} />
    </>
  );
}
