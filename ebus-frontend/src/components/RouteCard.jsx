import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Navigation, DollarSign, Calendar } from 'lucide-react';

const RouteCard = ({ route, searchParams }) => {
  return (
    <div className="relative group">
      {/* Background blur effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
      
      {/* Main card */}
      <div className="relative backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 rounded-3xl border border-gray-200/20 shadow-lg hover:shadow-2xl transition-all duration-300">
        <div className="p-8">
          {/* Header section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <Navigation className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Route Details
                </h3>
              </div>
              <div className="px-4 py-1.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full backdrop-blur-sm">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {route.distance} miles
                </span>
              </div>
            </div>

            {/* Route path */}
            <div className="flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl p-4">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">{route.origin}</span>
              <ArrowRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">{route.destination}</span>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {/* Fare card */}
            <div className="p-4 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl backdrop-blur-sm border border-gray-200/20">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fare</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">${route.base_fare}</p>
                </div>
              </div>
            </div>

            {/* Duration card */}
            <div className="p-4 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl backdrop-blur-sm border border-gray-200/20">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{route.estimated_duration}</p>
                </div>
              </div>
            </div>

            {/* Date card */}
            <div className="p-4 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl backdrop-blur-sm border border-gray-200/20">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{searchParams.date}</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            to={`/routes/${route.id}`}
            className="mt-6 block w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center font-medium rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 active:scale-98"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RouteCard;
