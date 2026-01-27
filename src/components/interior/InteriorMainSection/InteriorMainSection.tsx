import { useMemo, useState } from 'react';
import styles from './InteriorMainSection.module.css';
import { useInteriorPage } from '@/pages/Interior/InteriorPageContext';
import type { InteriorCategoryKey } from '@/types/page';

import InteriorHeaderSection from '@/components/interior/InteriorHeaderSection/InteriorHeaderSection';
import InteriorThumbSection from '@/components/interior/InteriorThumbSection/InteriorThumbSection';
import InteriorPagination from '@/components/interior/InteriorPagination/InteriorPagination';

const PAGE_SIZE = 8;

export default function InteriorMainSection() {
  const vm = useInteriorPage();
  if (!vm) return null;

  const [category, setCategory] = useState<InteriorCategoryKey>('all');
  const [page, setPage] = useState(1);

  const filteredProjects = useMemo(() => {
    if (category === 'all') return vm.projects;
    return vm.projects.filter((p) => p.category === category);
  }, [vm.projects, category]);

  const totalCount = filteredProjects.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredProjects.slice(start, start + PAGE_SIZE);
  }, [filteredProjects, safePage]);

  const onChangeCategory = (k: InteriorCategoryKey) => {
    setCategory(k);
    setPage(1);
  };

  return (
    <section className={styles.section} aria-label="인테리어">
      <div className={styles.inner}>
        <InteriorHeaderSection
          title={vm.headerText.title}
          description={vm.headerText.description}
          categories={vm.categories}
          activeCategory={category}
          onChangeCategory={onChangeCategory}
        />

        <InteriorThumbSection projects={pageItems} />

        <InteriorPagination
          page={safePage}
          totalCount={totalCount}
          pageSize={PAGE_SIZE}
          maxButtons={5}
          onChange={setPage}
        />
      </div>
    </section>
  );
}
