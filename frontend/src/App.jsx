import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminShops } from './pages/admin/AdminShops';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminSessions } from './pages/admin/AdminSessions';
import { CustomerReviewPage } from './pages/customer/CustomerReviewPage';
import { HomePage } from './pages/HomePage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Home Route */}
            <Route path="/" element={<HomePage />} />

            {/* Customer Review Flow (Scanned via QR) */}
            <Route path="/r/:qrToken" element={<CustomerReviewPage />} />

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="shops" element={<AdminShops />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="sessions" element={<AdminSessions />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
