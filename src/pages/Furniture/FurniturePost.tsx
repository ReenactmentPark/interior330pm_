import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Loading from '@/components/common/Loading';
import { getFurniturePage } from '@/services/page.service';
import type { FurnitureApiResponse } from '@/types/page';
import { getPostBlocks } from '@/data/postContent';
import PostContent from '@/components/board/PostContent/PostContent';
import BoardListSection from '@/components/board/BoardListSection/BoardListSection';

type LoadState =
  | { status: 'loading' }
  | { status: 'success'; data: FurnitureApiResponse }
  | { status: 'error'; error: unknown };

export default function FurniturePost() {
  const { projectId } = useParams<{ projectId: string }>();
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    // furniture는 지금 로컬 import라 signal 의미 없지만 시그니처 맞춰둠
    getFurniturePage()
      .then((data) => setState({ status: 'success', data }))
      .catch((error) => setState({ status: 'error', error }));
  }, []);

  const project = useMemo(() => {
    if (state.status !== 'success') return null;
    return state.data.projects.find((p) => p.id === projectId) ?? null;
  }, [state, projectId]);

  const blocks = useMemo(() => getPostBlocks('furniture', projectId ?? ''), [projectId]);

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
        <Link to="/furniture" style={{ fontSize: 13 }}>
          가구제작 목록으로
        </Link>
      </div>
    );
  }

  return (
    <main style={{ padding: '20px var(--page-padding-x) 64px' }}>
      <header style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>{project.title}</h1>
        <p style={{ marginTop: 8, fontSize: 13, color: 'rgba(0,0,0,0.6)' }}>{project.period}</p>
      </header>

      <PostContent blocks={blocks} />

      <BoardListSection kind="furniture" items={state.data.projects} />
    </main>
  );
}
