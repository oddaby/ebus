// src/pages/SchedulePage.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSchedules,
  selectSchedulesByRouteId,
  selectSchedulesStatus,
  selectSchedulesError,
} from '../store/slices/scheduleSlice';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 ${className}`}>
    {children}
  </div>
);

const SchedulePage = () => {
  const { id: routeId } = useParams(); // The route ID from the URL
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const schedules = useSelector((state) =>
    selectSchedulesByRouteId(state, routeId)
  );
  const status = useSelector(selectSchedulesStatus);
  const error = useSelector(selectSchedulesError);

  // Fetch schedules when the component mounts if they are not already loaded
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSchedules());
    }
  }, [status, dispatch]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
        <p className="text-xl text-blue-500">Loading schedules...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
        <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 p-8">
        <p className="text-xl text-gray-800 dark:text-gray-200">
          No schedules found for route {routeId}.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center space-x-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Route</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 p-8">
      {/* Page Header */}
      <header className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Route</span>
        </button>
        <h1 className="text-3xl font-bold mt-4 text-gray-800 dark:text-gray-200">
          Schedules for Route {routeId}
        </h1>
      </header>

      {/* Schedules List */}
      <div className="grid gap-6">
        {schedules.map((schedule) => (
          <Card key={schedule.id} className="border-l-8 border-blue-500">
            {/* Header with Origin/Destination and Date */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {schedule.route_details.origin} to {schedule.route_details.destination}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(schedule.departure_time).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Departure/Arrival & Fare */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Departure Time</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {new Date(schedule.departure_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Arrival Time</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {new Date(schedule.arrival_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fare</p>
                <p className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
                  <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                  {schedule.fare}
                </p>
              </div>
            </div>

            {/* Bus Details */}
            <div className="mb-4">
              <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Bus Details
              </h3>
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-sm text-gray-500">Bus Number</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {schedule.bus_details.bus_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {schedule.bus_details.bus_type_display}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Capacity</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {schedule.bus_details.capacity}
                  </p>
                </div>
              </div>
              {schedule.bus_details.amenities && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Amenities</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {schedule.bus_details.amenities}
                  </p>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-sm text-gray-500">Available Seats</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {schedule.available_seats_count} / {schedule.bus_details.capacity}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {schedule.duration} hours
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SchedulePage;
