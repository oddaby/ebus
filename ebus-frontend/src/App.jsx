// src/App.jsx
import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, selectIsAuthenticated } from './store/slices/authSlice';

// Lazy load pages
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const RouteDetails = React.lazy(() => import('./pages/RouteDetail'));
const SchedulePage = React.lazy(() => import('./pages/SchedulePage')); // New Schedule page

// Loader component for lazy loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <p>Loading...</p>
  </div>
);

// Optional ErrorBoundary to catch errors in any child components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-800 p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 text-red-600">Something went wrong.</h2>
            <p className="text-gray-700 dark:text-gray-300">{this.state.errorMessage}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Fetch user profile if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Home Route: Accessible only if authenticated */}
          <Route
            path="/"
            element={
              isAuthenticated ? <Home /> : <Navigate to="/login" replace />
            }
          />

          {/* Login Route: Redirect to Home if already authenticated */}
          <Route
            path="/login"
            element={
              !isAuthenticated ? <Login /> : <Navigate to="/" replace />
            }
          />

          {/* Register Route: Redirect to Home if already authenticated */}
          <Route
            path="/register"
            element={
              !isAuthenticated ? <Register /> : <Navigate to="/" replace />
            }
          />

          {/* Route Details: Protected Route */}
          <Route
            path="/routes/:id"
            element={
              isAuthenticated ? <RouteDetails /> : <Navigate to="/login" replace />
            }
          />

          {/* Schedule Page: Shows schedules for a specific route */}
          {/* IMPORTANT: The URL parameter here is ":id". Ensure that your navigation passes a real ID. */}
          <Route
            path="/buses/schedules/:id"
            element={
              isAuthenticated ? <SchedulePage /> : <Navigate to="/login" replace />
            }
          />

          

          {/* Fallback Route: Redirect unknown paths to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
