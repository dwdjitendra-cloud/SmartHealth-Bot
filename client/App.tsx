// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import Navbar from './components/Navbar';
// import Home from './pages/Home';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Dashboard from './pages/Dashboard';
// import Prediction from './pages/Prediction';
// import Doctors from './pages/Doctors';
// import Profile from './pages/Profile';
// import { AuthProvider, useAuth } from './contexts/AuthContext';
// import LoadingSpinner from './components/LoadingSpinner';

// // Protected Route Component
// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//   const { user, loading } = useAuth();
  
//   if (loading) {
//     return <LoadingSpinner />;
//   }
  
//   return user ? <>{children}</> : <Navigate to="/login" />;
// };

// // Public Route Component (redirect to dashboard if logged in)
// const PublicRoute = ({ children }: { children: React.ReactNode }) => {
//   const { user, loading } = useAuth();
  
//   if (loading) {
//     return <LoadingSpinner />;
//   }
  
//   return !user ? <>{children}</> : <Navigate to="/dashboard" />;
// };

// function AppContent() {
//   const { user } = useAuth();

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
//       <main className="pt-16">
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/" element={<Home />} />
//           <Route 
//             path="/login" 
//             element={
//               <PublicRoute>
//                 <Login />
//               </PublicRoute>
//             } 
//           />
//           <Route 
//             path="/register" 
//             element={
//               <PublicRoute>
//                 <Register />
//               </PublicRoute>
//             } 
//           />
          
//           {/* Protected Routes */}
//           <Route 
//             path="/dashboard" 
//             element={
//               <ProtectedRoute>
//                 <Dashboard />
//               </ProtectedRoute>
//             } 
//           />
//           <Route 
//             path="/prediction" 
//             element={
//               <ProtectedRoute>
//                 <Prediction />
//               </ProtectedRoute>
//             } 
//           />
//           <Route 
//             path="/doctors" 
//             element={
//               <ProtectedRoute>
//                 <Doctors />
//               </ProtectedRoute>
//             } 
//           />
//           <Route 
//             path="/profile" 
//             element={
//               <ProtectedRoute>
//                 <Profile />
//               </ProtectedRoute>
//             } 
//           />
          
//           {/* Catch all route */}
//           <Route path="*" element={<Navigate to="/" />} />
//         </Routes>
//       </main>
//       <Toaster 
//         position="top-right"
//         toastOptions={{
//           duration: 4000,
//           style: {
//             background: '#363636',
//             color: '#fff',
//           },
//         }}
//       />
//     </div>
//   );
// }

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <AppContent />
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;
import React, { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './src/contexts/AuthContext';
import { useAuth } from './src/contexts/AuthContext';
import Navbar from './Navbar';
import Home from './src/pages/Home';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import Dashboard from './src/pages/Dashboard';
import SymptomChecker from './src/pages/SymptomChecker';
// import Payment from './src/pages/Payment';
import Doctors from './src/pages/Doctors';
import Profile from './src/pages/Profile';



interface RouteProps {
  children: ReactNode;
}
// Protected Route Component
function ProtectedRoute({ children }: RouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}

// Public Route Component (redirect to dashboard if logged in)
const PublicRoute = ({ children }:RouteProps) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
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
            {/* <Route path="/payment" element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            } /> */}
            <Route path="/doctors" element={
              <ProtectedRoute>
                <Doctors />
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
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;