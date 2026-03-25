import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import UploadPage from './pages/UploadPage';
import ClaimsListPage from './pages/ClaimsListPage';
import ClaimDetailPage from './pages/ClaimDetailPage';
import ReportsPage from './pages/ReportsPage';

// PUBLIC_INTERFACE
function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/upload" replace />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/claims" element={<ClaimsListPage />} />
        <Route path="/claims/:id" element={<ClaimDetailPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/upload" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
