import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { RequireRole } from './components/common/RequireRole'
import { AppLayout } from './components/layout/AppLayout'
import { AuthProvider } from './context/AuthContext'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { ItemDetailPage } from './pages/items/ItemDetailPage'
import { ItemsPage } from './pages/items/ItemsPage'
import { MyReportsPage } from './pages/items/MyReportsPage'
import { ReportItemPage } from './pages/items/ReportItemPage'
import { LandingPage } from './pages/LandingPage'
import { MatchesPage } from './pages/MatchesPage'
import { NotificationsPage } from './pages/NotificationsPage'

// Code-split the admin section and the messaging/socket.io bundle — most
// users (students) never open either, so there's no reason to ship them in
// the initial bundle.
const AdminLayout = lazy(() => import('./components/layout/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })))
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage })))
const AdminAuditLogsPage = lazy(() => import('./pages/admin/AdminAuditLogsPage').then((m) => ({ default: m.AdminAuditLogsPage })))
const MessagesPage = lazy(() => import('./pages/messages/MessagesPage').then((m) => ({ default: m.MessagesPage })))
const ConversationPage = lazy(() => import('./pages/messages/ConversationPage').then((m) => ({ default: m.ConversationPage })))

const queryClient = new QueryClient()

function PageFallback() {
  return <p className="p-8 text-center text-slate-500">Loading…</p>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/items" element={<ItemsPage />} />
                <Route path="/items/:id" element={<ItemDetailPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/report" element={<ReportItemPage />} />
                  <Route path="/my-reports" element={<MyReportsPage />} />
                  <Route path="/matches" element={<MatchesPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/messages/:conversationId" element={<ConversationPage />} />
                  <Route element={<RequireRole roles={['ADMIN', 'MODERATOR']} />}>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminDashboardPage />} />
                      <Route path="users" element={<AdminUsersPage />} />
                      <Route path="reports" element={<AdminReportsPage />} />
                      <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                    </Route>
                  </Route>
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
