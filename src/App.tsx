import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home/Home';
import Interior from '@/pages/Interior/Interior';
import Furniture from '@/pages/Furniture/Furniture';
import Inquiry from '@/pages/Inquiry/Inquiry';
import InteriorPost from '@/pages/Interior/InteriorPost';
import FurniturePost from '@/pages/Furniture/FurniturePost';

const AdminRouter = lazy(() => import('@/admin/routes/AdminRouter'));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={null}>
              <AdminRouter />
            </Suspense>
          }
        />

        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/interior" element={<Interior />} />
          <Route path="/furniture" element={<Furniture />} />
          <Route path="/inquiry" element={<Inquiry />} />
          <Route path="/interior/:projectId" element={<InteriorPost />} />
          <Route path="/furniture/:projectId" element={<FurniturePost />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}