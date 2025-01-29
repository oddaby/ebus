import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRouteDetails } from '../features/routes/routeSlice';
import { Clock, MapPin, Users, ChevronLeft } from 'lucide-react';

const BookingDetails = () => {
  const { routeId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    currentRoute: route,
    status,
    error
  } = useSelector((state) => state.routes);
  const { date } = useSelector((state) => state.routes.searchParams);

  useEffect(() => {
    if (routeId) {
      dispatch(fetchRouteDetails(routeId));
    }
  }, [dispatch, routeId]);

  if (status === 'loading') {
    return <div className="text-center py-8">Loading route details...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error: {error}
        <button
          onClick={() => dispatch(fetchRouteDetails(routeId))}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!route) {
    return <div className="text-center py-8">Route not found</div>;
  }

  // Temporary fallback data structure
  const safeRoute = {
    ...route,
    amenities: route.amenities || [],
    policies: route.policies || [],
    schedules: route.schedules || [],
    base_fare: route.base_fare || 0,
    taxes: route.taxes || 0
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Routes
      </button>

      {/* Route Details Content */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/20 shadow-lg p-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Trip Details
          </h1>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-4 py-2 rounded-full">
            {route.distance} miles
          </span>
        </div>

        {/* Route Path */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <MapPin className="w-6 h-6 text-green-500" />
              <span className="text-lg font-medium">{route.origin}</span>
            </div>
            <div className="flex items-center space-x-4">
              <MapPin className="w-6 h-6 text-red-500" />
              <span className="text-lg font-medium">{route.destination}</span>
            </div>
          </div>
        </div>

        {/* Trip Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">Trip Information</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <span>Duration: {route.estimated_duration}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span>Departure: {date}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-500" />
                <span>Available Seats: {route.available_seats}</span>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">Pricing</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Base Fare:</span>
                <span>${safeRoute.base_fare}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Fees:</span>
                <span>${safeRoute.taxes}</span>
              </div>
              <div className="flex justify-between font-semibold pt-4 border-t border-gray-200">
                <span>Total:</span>
                <span>${(safeRoute.base_fare + safeRoute.taxes).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Departure Schedule */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-4">Departure Times</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {safeRoute.schedules.map((schedule, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl"
              >
                <div className="font-medium">{schedule.time}</div>
                <div className="text-sm text-gray-500">
                  {schedule.seats} seats left
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;