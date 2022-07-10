import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { RequireRole } from './components/common/RequireRole'
import { AdminLayout } from './components/layout/AdminLayout'
import { AppLayout } from './components/layout/AppLayout'
import { AuthProvider } from './context/AuthContext'
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminReportsPage } from './pages/admin/AdminReportsPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
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
import { ConversationPage } from './pages/messages/ConversationPage'
import { MessagesPage } from './pages/messages/MessagesPage'
import { NotificationsPage } from './pages/NotificationsPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
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
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
