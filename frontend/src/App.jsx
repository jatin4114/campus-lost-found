import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/common/ProtectedRoute'
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
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
