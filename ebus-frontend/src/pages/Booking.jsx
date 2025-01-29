import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Clock, Navigation, DollarSign, Calendar } from 'lucide-react';

const Booking = () => {
  const { routeId } = useParams();
  const [searchParams] = useSearchParams();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRouteDetails = async () => {
      try {
        const response = await api.get(`/routes/${routeId}/`);
        setRoute(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load route details');
      } finally {
        setLoading(false);
      }
    };

    fetchRouteDetails();
  }, [routeId]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
          Book Your Journey
        </h1>

        {/* Route Details */}
        <div className="mb-8">
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
            <span className="text-xl font-semibold text-gray-800 dark:text-white">
              {route.origin}
            </span>
            <span className="text-xl font-semibold text-gray-800 dark:text-white">
              {route.destination}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DetailCard 
              icon={<Navigation className="w-5 h-5" />}
              label="Distance"
              value={`${route.distance} miles`}
              color="text-blue-500"
            />
            <DetailCard 
              icon={<Clock className="w-5 h-5" />}
              label="Duration"
              value={route.estimated_duration}
              color="text-green-500"
            />
            <DetailCard 
              icon={<DollarSign className="w-5 h-5" />}
              label="Fare"
              value={`$${route.base_fare}`}
              color="text-purple-500"
            />
            <DetailCard 
              icon={<Calendar className="w-5 h-5" />}
              label="Date"
              value={searchParams.get('date')}
              color="text-orange-500"
            />
          </div>
        </div>

        {/* Booking Form */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Passenger Details
          </h2>
          
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Full Name" type="text" required />
              <InputField label="Email" type="email" required />
              <InputField label="Phone Number" type="tel" required />
              <InputField label="Number of Passengers" type="number" min="1" required />
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Confirm Booking
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const DetailCard = ({ icon, label, value, color }) => (
  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
    <div className="flex items-center space-x-3">
      <div className={`p-2 rounded-lg bg-opacity-10 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="font-semibold text-gray-800 dark:text-white">{value}</p>
      </div>
    </div>
  </div>
);

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label}
    </label>
    <input
      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
      {...props}
    />
  </div>
);

export default Booking;