import { Routes, Route, Navigate } from 'react-router-dom';
import AdminGuard from '@/admin/routes/AdminGuard';

import AdminLoginPage from '@/admin/pages/AdminLoginPage/AdminLoginPage';
import AdminLayout from '@/admin/components/AdminLayout/AdminLayout';

import Home from '@/pages/Home/Home';
import Interior from '@/pages/Interior/Interior';
import Furniture from '@/pages/Furniture/Furniture';

export default function AdminRoutes() {
  return (
    <Routes>
      {/* ✅ 로그인 페이지는 Guard 밖 */}
      <Route index element={<AdminLoginPage />} />

      {/* ✅ 여기부터 보호 */}
      <Route element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route path="home" element={<Home />} />
          <Route path="interior" element={<Interior />} />
          <Route path="furniture" element={<Furniture />} />
          <Route path="inquiry" element={<Navigate to="/admin/home" replace />} />
        </Route>
      </Route>

      {/* 안전장치 */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
