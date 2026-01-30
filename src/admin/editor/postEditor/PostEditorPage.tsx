import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './PostEditorPage.module.css';

import type { EditorKind } from './postEditor.types';
import { usePostEditor } from './usePostEditor';

import EditorTopBar from './components/EditorTopBar';
import MetaBar from './components/MetaBar/MetaBar';

import EditorToolbar from './components/EditorToolbar/EditorToolbar';
import LexicalEditor, {
  type LexicalEditorHandle,
  type EditorSelectionStyle,
} from './components/LexicalEditor/LexicalEditor';

const isEditorKind = (v: string | null): v is EditorKind => v === 'interior' || v === 'furniture';

function pickImageFileViaDialog(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;

    input.onchange = () => {
      const file = input.files?.[0] ?? null;
      resolve(file);
    };

    // 사용자가 취소했는데 onchange가 안 뜨는 케이스 대비 (브라우저별 차이)
    input.oncancel = () => resolve(null);

    input.click();
  });
}

export default function PostEditorPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialKind = useMemo<EditorKind>(() => {
    const k = searchParams.get('kind');
    return isEditorKind(k) ? k : 'interior';
  }, [searchParams]);

  const [kind, setKind] = useState<EditorKind>(initialKind);

  useEffect(() => {
    setKind(initialKind);
  }, [initialKind]);

  const editor = usePostEditor(kind);
  const [toast, setToast] = useState<string | null>(null);

  const subtitle = useMemo(() => {
    return kind === 'interior' ? '인테리어디자인 게시글 작성' : '가구제작 게시글 작성';
  }, [kind]);

  const showToast = (msg: string, ms = 1700) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), ms);
  };

  const onSave = () => {
    const res = editor.validateAndPublish();
    if (!res.ok) return showToast(res.message, 2200);
    return showToast('저장 완료 (임시 draft 저장)');
  };

  const onKindChange = (next: EditorKind) => {
    setKind(next);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('kind', next);
      return p;
    });
  };

  const editorRef = useRef<LexicalEditorHandle | null>(null);

  const [selStyle, setSelStyle] = useState<EditorSelectionStyle>({
    bold: false,
    fontFamilyLabel: '기본서체',
    fontSize: 13,
    align: 'left',
    color: '#2E2E2E'
  });

  /**
   * ✅ 지금은 임시로 OS 파일 선택창 + ObjectURL
   * 나중에 "홈 이미지 변경" 저장소 모달 연결하면:
   * - pickImage: 모달에서 URL 받아서 return
   * - uploadImage: 업로드 후 URL return
   */
  const pickImage = async (): Promise<string | null> => {
    const file = await pickImageFileViaDialog();
    if (!file) return null;
    return URL.createObjectURL(file);
  };

  const uploadImage = async (file: File): Promise<string> => {
    // 임시: 업로드 없이 즉시 표시
    return URL.createObjectURL(file);
  };

  return (
    <div className={styles.page}>
      <EditorTopBar
        title="게시글 작성"
        subtitle={subtitle}
        meta={`블록 ${editor.stats.blockCount}개${editor.stats.dirty ? ' · 수정됨' : ''}`}
        onReset={editor.reset}
        onSave={onSave}
      />

      <div className={styles.metaBar}>
        <MetaBar kind={kind} draft={editor.draft} onKindChange={onKindChange} onChange={editor.update} />
      </div>

      <div className={styles.grid}>
        <section className={styles.center}>
          <div className={styles.toolbarRow}>
            <EditorToolbar
              fontLabel={selStyle.fontFamilyLabel}
              sizeLabel={selStyle.fontSize}
              isBold={selStyle.bold}
              colorLabel={selStyle.color}
              align={selStyle.align}
              onClickImage={() => editorRef.current?.requestInsertImage()} // ✅ 카메라
              onPickFont={(font) => {
                editorRef.current?.applyFontFamily(font);
                editorRef.current?.focus();
              }}
              onPickSize={(sz) => {
                editorRef.current?.applyFontSize(sz);
                editorRef.current?.focus();
              }}
              onToggleBold={() => {
                editorRef.current?.applyBold();
                editorRef.current?.focus();
              }}
              onPickColor={(c) => {
                editorRef.current?.applyColor(c);
                editorRef.current?.focus();
              }}
              onPickAlign={(a) => {
                editorRef.current?.applyAlign(a);
                editorRef.current?.focus();
              }}
            />
          </div>

          <LexicalEditor
            ref={editorRef}
            value={editor.draft.content.value}
            onChange={editor.updateContent}
            onSelectionStyleChange={setSelStyle}
            pickImage={pickImage}
            uploadImage={uploadImage}
          />
        </section>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
