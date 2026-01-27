import { useEffect, useMemo, useState } from 'react';
import Loading from '@/components/common/Loading';
import { getInteriorPage } from '@/services/page.service';
import type { InteriorApiResponse, InteriorPageViewModel } from '@/types/page';
import { InteriorPageProvider } from './InteriorPageContext';
import InteriorMainSection from '@/components/interior/InteriorMainSection/InteriorMainSection';

type LoadState =
  | { status: 'loading' }
  | { status: 'success'; data: InteriorApiResponse }
  | { status: 'error'; error: unknown };

function mapInteriorApiToViewModel(api: InteriorApiResponse): InteriorPageViewModel {
  return {
    headerText: api.headerText,
    categories: api.categories,
    projects: api.projects,
  };
}

export default function Interior() {
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

  const vm = useMemo(() => {
    if (state.status !== 'success') return null;
    return mapInteriorApiToViewModel(state.data);
  }, [state]);

  return (
    <>
      {state.status === 'loading' && <Loading label="인테리어 콘텐츠 불러오는 중" />}

      {state.status === 'error' && (
        <div style={{ padding: '12px var(--page-padding-x)', fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>
          인테리어 데이터를 불러오지 못했습니다. (interior.example.json 확인 필요)
        </div>
      )}

      {vm && (
        <InteriorPageProvider value={vm}>
          <InteriorMainSection />
        </InteriorPageProvider>
      )}
    </>
  );
}
