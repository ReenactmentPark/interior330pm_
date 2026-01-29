import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Loading from '@/components/common/Loading';
import { getInteriorPage } from '@/services/page.service';
import type { InteriorApiResponse } from '@/types/page';
import { getPostBlocks } from '@/data/postContent';
import PostContent from '@/components/board/PostContent/PostContent';
import BoardListSection from '@/components/board/BoardListSection/BoardListSection';

type LoadState =
  | { status: 'loading' }
  | { status: 'success'; data: InteriorApiResponse }
  | { status: 'error'; error: unknown };

export default function InteriorPost() {
  const { projectId } = useParams<{ projectId: string }>();
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    getInteriorPage(controller.signal)
      .then((data) => setState({ status: 'success', data }))
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({ status: 'error', error });
      });

    return () => controller.abort();
  }, []);

  const project = useMemo(() => {
    if (state.status !== 'success') return null;
    return state.data.projects.find((p) => p.id === projectId) ?? null;
  }, [state, projectId]);

  const blocks = useMemo(() => getPostBlocks('interior', projectId ?? ''), [projectId]);

  if (state.status === 'loading') return <Loading label="게시글 불러오는 중" />;

  if (state.status === 'error') {
    return (
      <div style={{ padding: '12px var(--page-padding-x)', fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>
        게시글 데이터를 불러오지 못했습니다.
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: '20px var(--page-padding-x)' }}>
        <div style={{ fontSize: 14, marginBottom: 10 }}>게시글을 찾을 수 없습니다.</div>
        <Link to="/interior" style={{ fontSize: 13 }}>
          인테리어 목록으로
        </Link>
      </div>
    );
  }

  return (
    <main style={{ padding: '20px var(--page-padding-x) 64px' }}>
      {/* 게시글 */}
      <header style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>{project.title}</h1>
        <p style={{ marginTop: 8, fontSize: 13, color: 'rgba(0,0,0,0.6)' }}>{project.period}</p>
      </header>

      <PostContent blocks={blocks} />

      {/* 목록 + 페이지네이션 (4번 이미지 섹션) */}
      <BoardListSection kind="interior" items={state.data.projects} />
    </main>
  );
}
