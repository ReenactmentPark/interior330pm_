import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useFurniturePage } from '@/pages/Furniture/FurniturePageContext';
import { useEditMode } from '@/admin/context/EditModeContext';

import FurnitureHeaderSection from '@/components/furniture/FurnitureHeaderSection/FurnitureHeaderSection';
import FurnitureThumbSection from '@/components/furniture/FurnitureThumbSection/FurnitureThumbSection';
import FurniturePagination from '@/components/furniture/FurniturePagination/FurniturePagination';

import styles from './FurnitureMainSection.module.css';

const PAGE_SIZE = 8;

export default function FurnitureMainSection() {
  
  const vm = useFurniturePage();
  const { pathname } = useLocation();
  const { enabled } = useEditMode();

  if (!vm) return null;
  
  //삭제(관리자) 시 즉시 화면에서 제거되게 하려고 vm.projects를 로컬 state로 관리
  const [projects, setProjects] = useState(vm.projects);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setProjects(vm.projects);
    setPage(1); // 데이터 소스가 바뀌면 1페이지로 리셋
  }, [vm.projects]);

  const totalCount = projects.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return projects.slice(start, start + PAGE_SIZE);
  }, [projects, safePage]);

  const onDelete = enabled
    ? (id: string) => {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    : undefined;

  // 삭제로 totalPages가 줄어 현재 page가 범위를 벗어나면 보정
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const isAdminFurniture = pathname.startsWith('/admin/furniture');

  return (
    <section className={styles.section} aria-label="가구제작">
      <div className={styles.inner}>
        <FurnitureHeaderSection title={vm.headerText.title} description={vm.headerText.description} />
        <FurnitureThumbSection projects={pageItems} onDelete={onDelete} />
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
