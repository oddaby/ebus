import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoutes, selectRoutesStatus, selectRoutesError, selectAllRoutes } from '../store/slices/routeSlice';
import RouteCard from '../components/RouteCard';
import SearchForm from '../components/SearchForm';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function Home() {
  const dispatch = useDispatch();
  
  // Use memoized selectors for better performance
  const routes = useSelector(selectAllRoutes);
  const status = useSelector(selectRoutesStatus);
  const error = useSelector(selectRoutesError);

  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleRefresh = useCallback(() => {
    dispatch(fetchRoutes());
  }, [dispatch]);

  // Fetch routes on component mount
  useEffect(() => {
    if (status === 'idle') {
      handleRefresh();
    }
  }, [status, handleRefresh]);

  // Memoized search function for better performance
  const filterRoute = useCallback((route) => {
    if (!route) return false;
    const matchesOrigin = !searchParams.origin || 
      route.origin?.toString().toLowerCase().includes(searchParams.origin.toLowerCase());
    const matchesDestination = !searchParams.destination || 
      route.destination?.toString().toLowerCase().includes(searchParams.destination.toLowerCase());
    return matchesOrigin && matchesDestination;
  }, [searchParams.origin, searchParams.destination]);

  // Memoize filtered routes
  const filteredRoutes = useMemo(() => {
    if (!Array.isArray(routes)) return [];
    return routes.filter(filterRoute);
  }, [routes, filterRoute]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-teal-600 dark:text-teal-400" />
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
              Finding the best routes...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 m-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              Available Routes
            </h1>
            <button
              onClick={handleRefresh}
              disabled={status === 'loading'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 
                dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Routes
            </button>
          </div>
          <SearchForm searchParams={searchParams} setSearchParams={setSearchParams} />
        </motion.div>

        <div className="mt-12 space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-600 dark:text-red-400">{error.toString()}</p>
            </div>
          )}

          {filteredRoutes.length === 0 && status === 'succeeded' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 space-y-4"
            >
              <div className="inline-block bg-teal-50 dark:bg-teal-900/20 p-4 rounded-full">
                <AlertCircle className="w-12 h-12 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                No routes found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Try adjusting your search filters or refresh the routes
              </p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredRoutes.map((route, index) => (
                <motion.div
                  key={route?.id || index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ 
                    delay: Math.min(index * 0.1, 1),
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                >
                  {route && (
                    <RouteCard 
                      route={route} 
                      searchParams={searchParams}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}