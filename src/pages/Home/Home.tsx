import { useEffect, useMemo, useState } from 'react';
import Loading from '@/components/common/Loading';
import { getHomePage } from '@/services/page.service';
import type { HomeApiResponse, HomePageViewModel, HighlightVm } from '@/types/page';
import { HomePageProvider } from './HomePageContext';
import HomeMainSection from '@/components/home/HomeMainSection/HomeMainSection';

type LoadState =
  | { status: 'loading' }
  | { status: 'success'; data: HomeApiResponse }
  | { status: 'error'; error: unknown };

function normalizeHighlight(text?: string | null, color?: string | null): HighlightVm {
  const t = typeof text === 'string' ? text.trim() : '';
  if (!t) return null;

  const c = typeof color === 'string' ? color.trim() : '';
  return { text: t, color: c || undefined };
}

function mapHomeApiToViewModel(api: HomeApiResponse): HomePageViewModel {
  const cards = api.sections.images.cards.slice(0, 4).map((c, idx) => ({
    url: c.url,
    alt: (c.alt ?? `카드 이미지 ${idx + 1}`) || `카드 이미지 ${idx + 1}`,
    raised: idx % 2 === 1,
  }));

  return {
    images: {
      heroUrl: api.sections.images.hero.url,
      heroAlt: (api.sections.images.hero.alt ?? '메인 이미지') || '메인 이미지',
      cards,
    },

    heroText: {
      title: api.sections.heroText.title,
      highlight: normalizeHighlight(api.sections.heroText.highlight, api.sections.heroText.highlightColor),
    },

    galleryText: {
      title: api.sections.galleryText.title,
      highlight: normalizeHighlight(
        api.sections.galleryText.highlight,
        api.sections.galleryText.highlightColor
      ),
      description: api.sections.galleryText.description,
    },

    cta: {
      backgroundUrl: api.sections.cta.background?.url ?? undefined,
      title: api.sections.cta.title,
      description: api.sections.cta.description,
      buttonLabel: api.sections.cta.button.label,
      buttonTo: api.sections.cta.button.to,
    },

    footer: api.sections.footer
      ? {
          leftLines: api.sections.footer.leftLines,
          rightLinks: api.sections.footer.rightLinks,
          copyright: api.sections.footer.copyright,
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
      {state.status === 'loading' && <Loading label="홈 콘텐츠 불러오는 중" />}

      {state.status === 'error' && (
        <div style={{ padding: '12px var(--page-padding-x)', fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>
          홈 데이터를 불러오지 못했습니다. (example.json 확인 필요)
        </div>
      )}

      {vm && (
        <HomePageProvider value={vm}>
          <HomeMainSection />
        </HomePageProvider>
      )}
    </>
  );
}
