// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home/Home';
import Interior from '@/pages/Interior/Interior';
import Furniture from '@/pages/Furniture/Furniture';
import Inquiry from '@/pages/Inquiry/Inquiry';

import InteriorPost from '@/pages/Interior/InteriorPost';
import FurniturePost from '@/pages/Furniture/FurniturePost';

import AdminRouter from '@/admin/routes/AdminRouter';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* admin은 Layout 밖에서 별도 라우팅 */}
        <Route path="/admin/*" element={<AdminRouter />} />

        {/* public */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />

          {/* list */}
          <Route path="/interior" element={<Interior />} />
          <Route path="/furniture" element={<Furniture />} />
          <Route path="/inquiry" element={<Inquiry />} />

          {/* ✅ detail (게시글) */}
          <Route path="/interior/:projectId" element={<InteriorPost />} />
          <Route path="/furniture/:projectId" element={<FurniturePost />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
