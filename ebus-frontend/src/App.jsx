import React, { useEffect, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Loader } from 'lucide-react';
import Navbar from './components/Navbar';
import { setUser, clearUser } from './store/slices/authSlice';
import api from './services/api';

// Lazy load pages
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Booking = React.lazy(() => import('./pages/Booking'));
const Payment = React.lazy(() => import('./pages/Payment'));
const BookingConfirmation = React.lazy(() => import('./pages/BookingConfirmation'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">Something went wrong</h2>
            <p className="mt-2 text-gray-600">{this.state.error?.message}</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const [isChecking, setIsChecking] = React.useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Add any additional auth checks here
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate check
        setIsChecking(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsChecking(false);
      }
    };
    checkAuth();
  }, []);

  if (isChecking || loading) {
    return <PageLoader />;
  }

  return isAuthenticated ? (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  ) : (
    <Navigate to="/login" replace state={{ from: window.location.pathname }} />
  );
};

// Main App Component
const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, accessToken } = useSelector((state) => state.auth);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      if (accessToken && isAuthenticated) {
        try {
          const response = await api.get('/users/profile/');
          if (response?.data) {
            dispatch(setUser(response.data));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          dispatch(clearUser());
        }
      }
    };

    initializeAuth();
  }, [accessToken, isAuthenticated, dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <ErrorBoundary>
        <Navbar />
        
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <Home />
                </Suspense>
              } 
            />
            
            <Route 
              path="/login" 
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <Suspense fallback={<PageLoader />}>
                    <Login />
                  </Suspense>
                )
              } 
            />
            
            <Route 
              path="/register" 
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <Suspense fallback={<PageLoader />}>
                    <Register />
                  </Suspense>
                )
              } 
            />

            {/* Protected Routes */}
            <Route
              path="/bookings/:routeId"
              element={
                <ProtectedRoute>
                  <Booking />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/confirmation"
              element={
                <ProtectedRoute>
                  <BookingConfirmation />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route 
              path="*" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <NotFound />
                </Suspense>
              } 
            />
          </Routes>
        </main>
      </ErrorBoundary>
    </div>
  );
};

export default App;