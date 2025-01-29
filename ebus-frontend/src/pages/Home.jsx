import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoutes } from '../store/slices/routeSlice';
import RouteCard from '../components/RouteCard';
import SearchForm from '../components/SearchForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';

export default function Home() {
  const dispatch = useDispatch();
  // Add type checking for the Redux state
  const { list: routes = [], status, error } = useSelector((state) => state.routes || {});

  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    // Wrap in try-catch to handle potential fetch errors
    try {
      dispatch(fetchRoutes());
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  }, [dispatch]);

  // Safeguard the filter operation
  const filteredRoutes = React.useMemo(() => {
    if (!Array.isArray(routes)) return [];
    
    return routes.filter(route => {
      if (!route) return false;
      
      const matchesOrigin = !searchParams.origin || 
        (route.origin && route.origin.toString().toLowerCase().includes(searchParams.origin.toLowerCase()));
      
      const matchesDestination = !searchParams.destination || 
        (route.destination && route.destination.toString().toLowerCase().includes(searchParams.destination.toLowerCase()));
      
      return matchesOrigin && matchesDestination;
    });
  }, [routes, searchParams.origin, searchParams.destination]);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Early return for loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center space-y-4 text-teal-600">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p className="text-lg font-medium">Finding the best routes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SearchForm 
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        </motion.div>

        <div className="mt-12">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl flex items-center space-x-3 max-w-2xl mx-auto">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <p className="text-red-600 dark:text-red-400 font-medium">
                {error.toString()}
              </p>
            </div>
          )}

          {filteredRoutes.length === 0 && status === 'succeeded' && (
            <div className="text-center py-16 space-y-4">
              <div className="inline-block bg-teal-50 dark:bg-teal-900/20 p-4 rounded-full">
                <AlertCircle className="w-12 h-12 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                No routes found matching your criteria
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Try adjusting your search filters
              </p>
            </div>
          )}

          <AnimatePresence mode="wait">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoutes.map((route, index) => (
                <motion.div
                  key={route?.id || index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ delay: Math.min(index * 0.1, 1) }}
                >
                  {route && (
                    <RouteCard 
                      route={route} 
                      searchParams={searchParams}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}