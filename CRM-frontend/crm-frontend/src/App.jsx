import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadDetail from './pages/LeadDetail';
import Deals from './pages/Deals';
import Followups from './pages/Followups';
import AuditLogs from './pages/AuditLogs';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

export default function App() {
  const { loading, user } = useAuth();
  const { theme } = useTheme();

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#1D1F26' : '#ffffff',
            color: theme === 'dark' ? '#FAF9F5' : '#14151A',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/leads/:id" element={<LeadDetail />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/followups" element={<Followups />} />
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute roles={['admin']}>
                <AuditLogs />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
