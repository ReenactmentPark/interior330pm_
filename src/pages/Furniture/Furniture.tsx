import { useEffect, useMemo, useState } from 'react';
import Loading from '@/components/common/Loading';
import { getFurniturePage } from '@/services/page.service';
import type { FurnitureApiResponse, FurniturePageViewModel } from '@/types/page';
import { FurniturePageProvider } from './FurniturePageContext';

import FurnitureMainSection from '@/components/furniture/FurnitureMainSection/FurnitureMainSection';


type LoadState =
  | { status: 'loading' }
  | { status: 'success'; data: FurnitureApiResponse }
  | { status: 'error'; error: unknown };

function mapFurnitureApiToViewModel(api: FurnitureApiResponse): FurniturePageViewModel {
  return {
    headerText: api.headerText,
    projects: api.projects,
  };
}

export default function Furniture() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    getFurniturePage(controller.signal)
      .then((data) => setState({ status: 'success', data }))
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({ status: 'error', error });
      });

    return () => controller.abort();
  }, []);

  const vm = useMemo(() => {
    if (state.status !== 'success') return null;
    return mapFurnitureApiToViewModel(state.data);
  }, [state]);

  return (
    <>
      {state.status === 'loading' && <Loading label="가구제작 콘텐츠 불러오는 중" />}

      {state.status === 'error' && (
        <div style={{ padding: '12px var(--page-padding-x)', fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>
          가구제작 데이터를 불러오지 못했습니다. (furniture.example.json 확인 필요)
        </div>
      )}

      {vm && (
        <FurniturePageProvider value={vm}>
          <FurnitureMainSection />
        </FurniturePageProvider>
      )}
    </>
  );
}
