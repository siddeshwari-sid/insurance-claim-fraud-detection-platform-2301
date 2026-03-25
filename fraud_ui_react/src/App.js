import React, { useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import UploadPage from './pages/UploadPage';
import ClaimsListPage from './pages/ClaimsListPage';
import ClaimDetailPage from './pages/ClaimDetailPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import { isAuthed, isAuthEnabled, signOut } from './auth/auth';
import { getAppName } from './config/brand';

function RequireAuth({ children }) {
  const location = useLocation();
  if (!isAuthed()) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

// PUBLIC_INTERFACE
function App() {
  const navigate = useNavigate();
  const [authedTick, setAuthedTick] = useState(0); // simple rerender trigger on sign-in/out

  const authed = useMemo(() => isAuthed(), [authedTick]);
  const enabled = useMemo(() => isAuthEnabled(), []);

  function onLogout() {
    signOut();
    setAuthedTick((x) => x + 1);
    navigate('/login', { replace: true });
  }

  function onLoginSuccess() {
    setAuthedTick((x) => x + 1);
    navigate('/upload', { replace: true });
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          enabled && !authed ? (
            <LoginPage appName={getAppName()} onSuccess={onLoginSuccess} />
          ) : (
            <Navigate to="/upload" replace />
          )
        }
      />

      <Route
        path="/*"
        element={
          <RequireAuth>
            <Layout authed={authed} authEnabled={enabled} onLogout={onLogout}>
              <Routes>
                <Route path="/" element={<Navigate to="/upload" replace />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/claims" element={<ClaimsListPage />} />
                <Route path="/claims/:id" element={<ClaimDetailPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="*" element={<Navigate to="/upload" replace />} />
              </Routes>
            </Layout>
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
