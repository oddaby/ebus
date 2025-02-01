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

const App = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // If the user is authenticated, fetch their profile
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div>
      <Routes>
        {/* Home Route: Accessible only if authenticated */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Suspense fallback={<PageLoader />}>
                <Home />
              </Suspense>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Login Route: Redirect to Home if already authenticated */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Suspense fallback={<PageLoader />}>
                <Login />
              </Suspense>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Register Route: Redirect to Home if already authenticated */}
        <Route
          path="/register"
          element={
            !isAuthenticated ? (
              <Suspense fallback={<PageLoader />}>
                <Register />
              </Suspense>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Route Details: Protected Route */}
        <Route
          path="/routes/:id"
          element={
            isAuthenticated ? (
              <Suspense fallback={<PageLoader />}>
                <RouteDetails />
              </Suspense>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Schedule Page: Shows schedules for a specific route */}
        <Route
          path="buses/schedules/"
          element={
            isAuthenticated ? (
              <Suspense fallback={<PageLoader />}>
                <SchedulePage />
              </Suspense>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        
      </Routes>
    </div>
  );
};

export default App;
