// Router + global auth hydration. On first mount we ask the server who we are
// (if we have a JWT lying around in localStorage) so the user doesn't see a
// login redirect flash on a hard refresh.
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/stores/auth';
import { RequireAuth } from '@/components/RequireAuth';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import ChatbotDetail from '@/pages/ChatbotDetail';
import PublicChat from '@/pages/PublicChat';
import ComingSoon from '@/pages/ComingSoon';

function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const user = useAuth((s) => s.user);
  const loading = useAuth((s) => s.loading);
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const hydrate = useAuth((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public, no-auth, no-chrome chat page — what the embed iframe loads. */}
        <Route path="/chat/:id" element={<PublicChat />} />

        <Route
          path="/login"
          element={
            <RedirectIfAuthed>
              <Login />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuthed>
              <Register />
            </RedirectIfAuthed>
          }
        />

        <Route
          path="/"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route path="/chatbots" element={<Navigate to="/" replace />} />
        <Route
          path="/chatbots/:id"
          element={
            <RequireAuth>
              <ChatbotDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/chatbots/:id/settings"
          element={
            <RequireAuth>
              <ComingSoon title="Chatbot settings" step="Step 11" />
            </RequireAuth>
          }
        />
        <Route
          path="/conversations"
          element={
            <RequireAuth>
              <ComingSoon title="Conversations" step="Step 11" />
            </RequireAuth>
          }
        />
        <Route
          path="/stats"
          element={
            <RequireAuth>
              <ComingSoon title="Analytics" step="Step 11" />
            </RequireAuth>
          }
        />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <ComingSoon title="Account" step="Step 11" />
            </RequireAuth>
          }
        />
        <Route
          path="/embed"
          element={
            <RequireAuth>
              <ComingSoon title="Embed" step="Step 10" />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
