import { useEffect, useMemo, useState } from 'react';
import HeroSection from '@/components/home/HeroSection';
import HomeImages from '@/components/home/HomeImages';
import Loading from '@/components/common/Loading';
import { getHomePage } from '@/services/page.service';
import type { HomeApiResponse, HomePageViewModel } from '@/types/page';
import { HomePageProvider } from './HomePageContext';

type LoadState =
  | { status: 'loading' }
  | { status: 'success'; data: HomeApiResponse }
  | { status: 'error'; error: unknown };

function mapHomeApiToViewModel(api: HomeApiResponse): HomePageViewModel {
  const cards = api.sections.images.cards.slice(0, 4).map((c, idx) => ({
    url: c.url,
    alt: c.alt ?? `카드 이미지 ${idx + 1}`,
    raised: idx % 2 === 1,
  }));

  return {
    images: {
      heroUrl: api.sections.images.hero.url,
      heroAlt: api.sections.images.hero.alt ?? '메인 이미지',
      cards,
    },
    cardText: {
      title: api.sections.cardText.title,
      highlight: api.sections.cardText.highlight
        ? { text: api.sections.cardText.highlight, color: api.sections.cardText.highlightColor }
        : undefined,
      description: api.sections.cardText.description,
    },
    cta: {
      backgroundUrl: api.sections.cta.background?.url,
      title: api.sections.cta.title,
      description: api.sections.cta.description,
      buttonLabel: api.sections.cta.button.label,
      buttonTo: api.sections.cta.button.to,
    },
    footer: api.footer
      ? {
          leftLines: api.footer.leftLines,
          rightLinks: api.footer.rightLinks,
          copyright: api.footer.copyright,
        }
      : undefined,
  };
}

export default function Home() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    getHomePage(controller.signal)
      .then((data) => setState({ status: 'success', data }))
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({ status: 'error', error });
      });

    return () => controller.abort();
  }, []);

  const vm = useMemo(() => {
    if (state.status !== 'success') return null;
    return mapHomeApiToViewModel(state.data);
  }, [state]);

  return (
    <>
      <HeroSection />

      {state.status === 'loading' && <Loading label="홈 콘텐츠 불러오는 중" />}

      {state.status === 'error' && (
        <div style={{ padding: '12px 5%', fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>
          홈 데이터를 불러오지 못했습니다. (example.json 확인 필요)
        </div>
      )}

      {vm && (
        <HomePageProvider value={vm}>
          <HomeImages vm={vm} />
        </HomePageProvider>
      )}
    </>
  );
}
