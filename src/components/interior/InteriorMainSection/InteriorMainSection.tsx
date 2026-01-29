import { useEffect, useMemo, useState } from 'react';
import { useInteriorPage } from '@/pages/Interior/InteriorPageContext';
import type { InteriorCategoryKey } from '@/types/page';
import { useEditMode } from '@/admin/context/EditModeContext';

import InteriorHeaderSection from '@/components/interior/InteriorHeaderSection/InteriorHeaderSection';
import InteriorThumbSection from '@/components/interior/InteriorThumbSection/InteriorThumbSection';
import InteriorPagination from '@/components/interior/InteriorPagination/InteriorPagination';
import styles from './InteriorMainSection.module.css';

const PAGE_SIZE = 8;

export default function InteriorMainSection() {
  const vm = useInteriorPage();
  const { enabled } = useEditMode();
  if (!vm) return null;

  const [projects, setProjects] = useState(vm.projects);

  useEffect(() => {
    setProjects(vm.projects);
  }, [vm.projects]);

  const [category, setCategory] = useState<InteriorCategoryKey>('all');
  const [page, setPage] = useState(1);

  const filteredProjects = useMemo(() => {
    if (category === 'all') return projects;
    return projects.filter((p) => p.category === category);
  }, [projects, category]);

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

  const onDelete = enabled
    ? (id: string) => {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    : undefined;

  // 삭제로 totalPages 줄면 page 보정
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

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

        <InteriorThumbSection projects={pageItems} onDelete={onDelete} />

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
