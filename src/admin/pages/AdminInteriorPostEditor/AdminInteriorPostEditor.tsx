import { Navigate } from 'react-router-dom';

export default function AdminInteriorPostEditor() {
  return <Navigate to="/admin/editor?kind=interior" replace />;
}