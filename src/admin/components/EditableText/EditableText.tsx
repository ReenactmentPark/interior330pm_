import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './EditableText.module.css';
import { useEditMode } from '@/admin/context/EditModeContext';
import { useEditDraft } from '@/admin/context/EditDraftContext';

type Props = {
  id: string;
  value: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3';
  className?: string;
};

export default function EditableText({ id, value, as = 'span', className }: Props) {
  const { enabled } = useEditMode();
  const { getText, setText, resetText, hasTextDraft } = useEditDraft();

  const Tag = as as any;
  const elRef = useRef<HTMLElement | null>(null);

  // ✅ Context에 저장된 draft (관리자 페이지 재진입 시 복원 가능)
  const persisted = getText(id, value);

  // ✅ 로컬 편집 값(타이핑 중 커서 튐 방지용)
  const draftRef = useRef<string>(persisted);
  const [dirtyLocal, setDirtyLocal] = useState(false);

  // 외부(취소/reset 등)로 값이 바뀌면 에디터에도 반영
  useEffect(() => {
    draftRef.current = persisted;
    setDirtyLocal(persisted !== value);

    const el = elRef.current;
    if (!el) return;
    // 포커스 중이면 강제 덮어쓰기 금지(커서 튐 방지)
    if (document.activeElement === el) return;

    el.textContent = persisted;
  }, [persisted, value]);

  const showActions = enabled && (dirtyLocal || hasTextDraft(id, value));

  const onInput = () => {
    const el = elRef.current;
    if (!el) return;
    const next = (el.textContent ?? '').replace(/\u00A0/g, ' ');
    draftRef.current = next;
    setDirtyLocal(next !== value);
  };

  const onCancel = () => {
    resetText(id);
    draftRef.current = value;
    setDirtyLocal(false);
    if (elRef.current) elRef.current.textContent = value;
  };

  // ✅ "수정" 누를 때만 Context 반영 (타이핑 중 rerender 없음)
  const onCommit = () => {
    setText(id, draftRef.current);
  };

  // ✅ 블러 시에도 draft를 저장해두면(선택) 버튼이 자연스럽게 유지됨
  // 요구사항은 "조금이라도 바뀌면 버튼 노출"이므로, blur에 저장은 OK
  const onBlur = () => {
    if (draftRef.current !== value) setText(id, draftRef.current);
  };

  const combined = useMemo(() => (className ? `${className} ${styles.editable}` : styles.editable), [className]);

  if (!enabled) {
    return <Tag className={className}>{value}</Tag>;
  }

  return (
    <span className={styles.wrap}>
      <Tag
        ref={elRef}
        className={combined}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onInput={onInput}
        onBlur={onBlur}
      >
        {persisted}
      </Tag>

      {showActions && (
        <span className={styles.actions} aria-label="수정 액션">
          <button type="button" className={styles.btn} onMouseDown={(e) => e.preventDefault()} onClick={onCommit}>
            수정
          </button>
          <button type="button" className={styles.btnGhost} onMouseDown={(e) => e.preventDefault()} onClick={onCancel}>
            취소
          </button>
        </span>
      )}
    </span>
  );
}
