import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './PostEditorPage.module.css';

import type { EditorKind } from './postEditor.types';
import { usePostEditor } from './usePostEditor';

import EditorTopBar from './components/EditorTopBar';
import MetaBar from './components/MetaBar/MetaBar';

import EditorToolbar from './components/EditorToolbar/EditorToolbar';
import LexicalEditor, { type LexicalEditorHandle, type EditorSelectionStyle } from './components/LexicalEditor/LexicalEditor';

import { extractImageUidsFromLexicalJSON, extractUniqueImageUids } from './postEditor.lexicalImages';

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
    color: '#2E2E2E',
  });

  /**
   * ✅ 로컬 이미지 저장소
   * - imageUid → { file, previewUrl }
   * - 저장 버튼 누를 때 서버로 보낼 payload를 만들 수 있게 해둔다.
   */
  const imageStoreRef = useRef(new Map<string, { file: File; previewUrl: string }>());

  const registerLocalImage = (file: File) => {
    const imageUid = crypto.randomUUID();
    const previewUrl = URL.createObjectURL(file);
    imageStoreRef.current.set(imageUid, { file, previewUrl });
    return { imageUid, src: previewUrl };
  };

  const reconcileImageStore = (nextEditorJson: string) => {
    const alive = new Set(extractImageUidsFromLexicalJSON(nextEditorJson));
    for (const [uid, entry] of imageStoreRef.current.entries()) {
      if (alive.has(uid)) continue;
      URL.revokeObjectURL(entry.previewUrl);
      imageStoreRef.current.delete(uid);
    }
  };

  const clearAllLocalImages = () => {
    for (const entry of imageStoreRef.current.values()) {
      URL.revokeObjectURL(entry.previewUrl);
    }
    imageStoreRef.current.clear();
  };

  // kind 변경 시(게시판 변경) 로컬 이미지 저장소 초기화
  useEffect(() => {
    clearAllLocalImages();
  }, [kind]);

  const onReset = () => {
    clearAllLocalImages();
    editor.reset();
  };

  const onSave = () => {
    const res = editor.validateAndPublish();
    if (!res.ok) return showToast(res.message, 2200);
    // ✅ validateAndPublish가 assetRefs를 리턴하도록 만든 상태라면 이걸 그대로 사용
    const assetRefs = res.assetRefs ?? extractUniqueImageUids(res.draft.content.value);

    // 1) 본문이 참조하는 이미지(assetRefs) 중 파일이 store에 없는지 검사
    const missing = assetRefs.filter((uid) => !imageStoreRef.current.get(uid)?.file);
    if (missing.length > 0) {
      showToast(`이미지 파일을 찾을 수 없습니다. 다시 삽입해주세요. (${missing.length}개)`, 2600);
      console.warn('[PostEditor] missing image files:', missing);
      return;
    }

    // 2) FormData 생성
    const form = new FormData();
    form.append('draft', JSON.stringify(res.draft));
    form.append('assetRefs', JSON.stringify(assetRefs));
    form.append('thumbnailImageUid', res.draft.thumbnailImageUid);

    // 3) 파일 첨부: assetRefs 기준으로만 업로드(본문에서 삭제된 파일은 제외)
    for (const uid of assetRefs) {
      const item = imageStoreRef.current.get(uid);
      if (!item) continue;

      form.append('images', item.file, item.file.name);
      form.append('imageUids', uid);
    }

    // ✅ 서버 아직 없으면 여기까지만 로그로 확인
    console.log('[PostEditor] formdata ready:', {
      title: res.draft.title,
      thumbnailImageUid: res.draft.thumbnailImageUid,
      assetRefsCount: assetRefs.length,
      filesCount: assetRefs.length,
    });
    showToast('FormData 준비 완료 (console 확인)');

    // ✅ 서버 붙이면 이 부분만 열어라
    // const r = await fetch('/api/posts', { method: 'POST', body: form });
    // if (!r.ok) return showToast('저장 실패', 2200);
    // showToast('저장 완료');
  };

  return (
    <div className={styles.page}>
      <EditorTopBar
        title="게시글 작성"
        subtitle={subtitle}
        meta={`블록 ${editor.stats.blockCount}개${editor.stats.dirty ? ' · 수정됨' : ''}`}
        onReset={onReset}
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
              onClickImage={() => editorRef.current?.requestInsertImage()}
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
            onChange={(next) => {
              reconcileImageStore(next);

              // 대표로 선택한 이미지가 삭제되면 자동 해제
              const alive = new Set(extractImageUidsFromLexicalJSON(next));
              if (editor.draft.thumbnailImageUid && !alive.has(editor.draft.thumbnailImageUid)) {
                editor.update('thumbnailImageUid', '');
              }

              editor.updateContent(next);
            }}
            onSelectionStyleChange={setSelStyle}
            thumbnailImageUid={editor.draft.thumbnailImageUid}
            onThumbnailImageUidChange={(next: string) => editor.update('thumbnailImageUid', next)}
            pickImageFile={pickImageFileViaDialog}
            registerLocalImage={registerLocalImage}
          />
        </section>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
