// src/admin/routes/AdminRouter.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminGuard from '@/admin/routes/AdminGuard';

import AdminLoginPage from '@/admin/pages/AdminLoginPage/AdminLoginPage';
import AdminLayout from '@/admin/components/AdminLayout/AdminLayout';

import Home from '@/pages/Home/Home';
import Interior from '@/pages/Interior/Interior';
import Furniture from '@/pages/Furniture/Furniture';

import AdminPostEditorPage from '@/admin/pages/AdminPostEditorPage/AdminPostEditorPage';
import AdminInteriorPostEditor from '@/admin/pages/AdminInteriorPostEditor/AdminInteriorPostEditor';
import AdminFurniturePostEditor from '@/admin/pages/AdminFurniturePostEditor/AdminFurniturePostEditor';

export default function AdminRoutes() {
  return (
    <Routes>
      {/* 로그인 */}
      <Route index element={<AdminLoginPage />} />

      {/* 보호 영역 */}
      <Route element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route path="home" element={<Home />} />
          <Route path="interior" element={<Interior />} />
          <Route path="furniture" element={<Furniture />} />

          {/* ✅ 공용 글쓰기(에디터) */}
          <Route path="editor" element={<AdminPostEditorPage />} />

          {/* ✅ 기존 주소 호환(안전/리다이렉트용) */}
          <Route path="interior/editor" element={<AdminInteriorPostEditor />} />
          <Route path="furniture/editor" element={<AdminFurniturePostEditor />} />

          <Route path="inquiry" element={<Navigate to="/admin/home" replace />} />
        </Route>
      </Route>

      {/* 안전장치 */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
