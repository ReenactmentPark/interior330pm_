import { Navigate } from 'react-router-dom';

export default function AdminFurniturePostEditor() {
  return <Navigate to="/admin/editor?kind=furniture" replace />;
}