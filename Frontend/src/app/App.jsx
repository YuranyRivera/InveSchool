import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import Loader from '@/components/feedback/Loader';
import Toaster from '@/components/feedback/Toaster';
import { ROUTES } from '@/app/routes';

// Cada página se descarga solo cuando se visita (code splitting).
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));
const DemoPage = lazy(() => import('@/features/auth/pages/DemoPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const ArticlesPage = lazy(() => import('@/features/inventory/pages/ArticlesPage'));
const UsersPage = lazy(() => import('@/features/users/pages/UsersPage'));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));
const SecurityPage = lazy(() => import('@/features/security/pages/SecurityPage'));
const MovementsPage = lazy(() => import('@/features/records/pages/MovementsPage'));
const TransfersPage = lazy(() => import('@/features/records/pages/TransfersPage'));
const AdministrativeDisposalsPage = lazy(() => import('@/features/records/pages/AdministrativeDisposalsPage'));
const StorageDisposalsPage = lazy(() => import('@/features/records/pages/StorageDisposalsPage'));
const SuppliersReportPage = lazy(() => import('@/features/records/pages/SuppliersReportPage'));

const PUBLIC_ROUTES = [
  { path: ROUTES.login, element: <LoginPage /> },
  { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
  { path: ROUTES.resetPassword, element: <ResetPasswordPage /> },
  { path: ROUTES.demo, element: <DemoPage /> },
];

const PRIVATE_ROUTES = [
  { path: ROUTES.dashboard, element: <DashboardPage /> },
  { path: ROUTES.articles, element: <ArticlesPage /> },
  { path: ROUTES.users, element: <UsersPage /> },
  { path: ROUTES.profile, element: <ProfilePage /> },
  { path: ROUTES.security, element: <SecurityPage /> },
  { path: ROUTES.movements, element: <MovementsPage /> },
  { path: ROUTES.transfers, element: <TransfersPage /> },
  { path: ROUTES.administrativeDisposals, element: <AdministrativeDisposalsPage /> },
  { path: ROUTES.storageDisposals, element: <StorageDisposalsPage /> },
  { path: ROUTES.suppliers, element: <SuppliersReportPage /> },
];

const App = () => (
  <AuthProvider>
    <Toaster />
    <BrowserRouter>
      <Suspense fallback={<Loader fullScreen />}>
        <Routes>
          {PUBLIC_ROUTES.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}

          <Route element={<ProtectedRoute />}>
            {PRIVATE_ROUTES.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>

          <Route path="/" element={<Navigate to={ROUTES.dashboard} replace />} />
          <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
