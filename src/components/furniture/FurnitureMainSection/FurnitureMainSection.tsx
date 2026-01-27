import { useMemo, useState } from 'react';
import styles from './FurnitureMainSection.module.css';
import { useFurniturePage } from '@/pages/Furniture/FurniturePageContext';
import type { InteriorCategoryKey } from '@/types/page';

import FurnitureHeaderSection from '@/components/furniture/FurnitureHeaderSection/FurnitureHeaderSection';
import FurnitureThumbSection from '@/components/furniture/FurnitureThumbSection/FurnitureThumbSection';
import FurniturePagination from '@/components/furniture/FurniturePagination/FurniturePagination';

const PAGE_SIZE = 8;

export default function FurnitureMainSection() {
  const vm = useFurniturePage();
  if (!vm) return null;

  const [category, setCategory] = useState<InteriorCategoryKey>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    // Frame30이 figma에서 display:none이라도,
    // 데이터가 all-only면 사실상 필터 UI는 안 뜨게 만들 수 있음(아래 header에서 처리)
    if (category === 'all') return vm.projects;
    return vm.projects.filter((p) => p.category === category);
  }, [vm.projects, category]);

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const onChangeCategory = (k: InteriorCategoryKey) => {
    setCategory(k);
    setPage(1);
  };

  return (
    <section className={styles.section} aria-label="가구제작">
      <div className={styles.inner}>
        <FurnitureHeaderSection
          title={vm.headerText.title}
          description={vm.headerText.description}
          categories={vm.categories}
          activeCategory={category}
          onChangeCategory={onChangeCategory}
        />

        <FurnitureThumbSection projects={pageItems} />

        <FurniturePagination
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
