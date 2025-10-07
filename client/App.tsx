import { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './src/contexts/AuthContext';
import { useAuth } from './src/contexts/AuthContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import Navbar from './Navbar';
import Home from './src/pages/Home';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import Dashboard from './src/pages/Dashboard';
import SymptomChecker from './src/pages/SymptomChecker';
import Doctors from './src/pages/Doctors';
import Profile from './src/pages/Profile';
import AIHealthcare from './src/pages/AIHealthcare';
import HealthcareDashboard from './src/pages/HealthcareDashboard';
import AdvancedHealthDashboard from './src/pages/AdvancedHealthDashboard';
import VitalSignsDashboard from './src/pages/VitalSignsDashboard';
import SmartMedicationDashboard from './src/pages/SmartMedicationDashboard';
import TelemedicineDashboard from './src/pages/TelemedicineDashboard';
import MentalHealthDashboard from './src/pages/MentalHealthDashboard';
import LoadingSpinner from './LoadingSpinner';

interface RouteProps {
  children: ReactNode;
}

// Protected Route Component
function ProtectedRoute({ children }: RouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

// Public Route Component (allow access regardless of login status)
const PublicRoute = ({ children }: RouteProps) => {
  const { loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a1c23 0%, #2d3142 50%, #1f2937 100%)' }}>
          <Navbar />
          <main className="pt-16 lg:pt-0 lg:ml-72 transition-all duration-300">{/* Updated to lighter neutral gradient for better contrast */}
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              
              {/* Demo Route - No Authentication Required */}
              <Route path="/demo" element={<SymptomChecker />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/symptom-checker" element={
                <ProtectedRoute>
                  <SymptomChecker />
                </ProtectedRoute>
              } />
              <Route path="/ai-healthcare" element={
                <ProtectedRoute>
                  <AIHealthcare />
                </ProtectedRoute>
              } />
              <Route path="/healthcare-dashboard" element={
                <ProtectedRoute>
                  <HealthcareDashboard />
                </ProtectedRoute>
              } />
              <Route path="/health-risk" element={
                <ProtectedRoute>
                  <AdvancedHealthDashboard />
                </ProtectedRoute>
              } />
              <Route path="/vital-signs" element={
                <ProtectedRoute>
                  <VitalSignsDashboard />
                </ProtectedRoute>
              } />
              <Route path="/medications" element={
                <ProtectedRoute>
                  <SmartMedicationDashboard />
                </ProtectedRoute>
              } />
              <Route path="/telemedicine" element={
                <ProtectedRoute>
                  <TelemedicineDashboard />
                </ProtectedRoute>
              } />
              <Route path="/mental-health" element={
                <ProtectedRoute>
                  <MentalHealthDashboard />
                </ProtectedRoute>
              } />
              <Route path="/doctors" element={
                <ProtectedRoute>
                  <Doctors />
                </ProtectedRoute>
              } />
              
              {/* Legacy routes for backward compatibility */}
              <Route path="/health-dashboard" element={
                <ProtectedRoute>
                  <AdvancedHealthDashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;