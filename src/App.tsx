import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home/Home';
import Interior from '@/pages/Interior/Interior';
import Furniture from '@/pages/Furniture/Furniture';
import Inquiry from '@/pages/Inquiry/Inquiry';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/interior" element={<Interior />} />
          <Route path="/furniture" element={<Furniture />} />
          <Route path="/inquiry" element={<Inquiry />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}