import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';

// Contributor
import ContributorDashboard from './pages/contributor/ContributorDashboard';
import TaskMarketplace from './pages/contributor/TaskMarketplace';
import TaskDetails from './pages/contributor/TaskDetails';
import TaskCompletion from './pages/contributor/TaskCompletion';
import MyTasks from './pages/contributor/MyTasks';
import ContributorWallet from './pages/contributor/ContributorWallet';
import Leaderboard from './pages/contributor/Leaderboard';
import ContributorProfile from './pages/contributor/ContributorProfile';

// Business
import BusinessDashboard from './pages/business/BusinessDashboard';
import CreateTask from './pages/business/CreateTask';
import BusinessTasks from './pages/business/BusinessTasks';
import SubmissionReview from './pages/business/SubmissionReview';
import BusinessAnalytics from './pages/business/BusinessAnalytics';
import BusinessWallet from './pages/business/BusinessWallet';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'contributor' | 'business' }) {
  const { isAuthenticated, role: userRole } = useAuth();
  if (!isAuthenticated) return <Navigate to="/signup" replace />;
  if (role && userRole !== role) return <Navigate to={userRole === 'business' ? '/app/business' : '/app/contributor'} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Contributor */}
      <Route path="/app/contributor" element={<ProtectedRoute role="contributor"><ContributorDashboard /></ProtectedRoute>} />
      <Route path="/app/contributor/tasks" element={<ProtectedRoute role="contributor"><TaskMarketplace /></ProtectedRoute>} />
      <Route path="/app/contributor/tasks/:id" element={<ProtectedRoute role="contributor"><TaskDetails /></ProtectedRoute>} />
      <Route path="/app/contributor/tasks/:id/complete" element={<ProtectedRoute role="contributor"><TaskCompletion /></ProtectedRoute>} />
      <Route path="/app/contributor/my-tasks" element={<ProtectedRoute role="contributor"><MyTasks /></ProtectedRoute>} />
      <Route path="/app/contributor/wallet" element={<ProtectedRoute role="contributor"><ContributorWallet /></ProtectedRoute>} />
      <Route path="/app/contributor/leaderboard" element={<ProtectedRoute role="contributor"><Leaderboard /></ProtectedRoute>} />
      <Route path="/app/contributor/profile" element={<ProtectedRoute role="contributor"><ContributorProfile /></ProtectedRoute>} />

      {/* Business */}
      <Route path="/app/business" element={<ProtectedRoute role="business"><BusinessDashboard /></ProtectedRoute>} />
      <Route path="/app/business/create-task" element={<ProtectedRoute role="business"><CreateTask /></ProtectedRoute>} />
      <Route path="/app/business/tasks" element={<ProtectedRoute role="business"><BusinessTasks /></ProtectedRoute>} />
      <Route path="/app/business/submissions" element={<ProtectedRoute role="business"><SubmissionReview /></ProtectedRoute>} />
      <Route path="/app/business/analytics" element={<ProtectedRoute role="business"><BusinessAnalytics /></ProtectedRoute>} />
      <Route path="/app/business/wallet" element={<ProtectedRoute role="business"><BusinessWallet /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
