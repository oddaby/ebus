// src/pages/SchedulePage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../services/api'; // Import your configured API client
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
  const { id: routeId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Local state for seat selection and booked seats
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [bookedSeatIds, setBookedSeatIds] = useState({}); // { scheduleId: [seatId, ...] }

  // Use memoized selector to get schedules for this route
  const schedules = useSelector((state) =>
    selectSchedulesByRouteId(state, routeId)
  );
  const status = useSelector(selectSchedulesStatus);
  const error = useSelector(selectSchedulesError);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSchedules());
    }
  }, [status, dispatch]);

  // Handler when a seat is clicked
  const handleSeatClick = (scheduleId, seat) => {
    // Only allow selection if the seat is available and not already booked (locally)
    const scheduleBooked = bookedSeatIds[scheduleId] || [];
    if (seat.is_available && !scheduleBooked.includes(seat.id)) {
      setSelectedSeat({ scheduleId, seat });
    }
  };

  // Confirm booking of selected seat and update the backend
  const confirmSeatBooking = async () => {
    if (selectedSeat) {
      const { scheduleId, seat } = selectedSeat;
      try {
        // Send a POST request to your backend endpoint to book the seat.
        // Adjust the URL and payload as per your backend API.
        await api.post(`buses/schedules/${scheduleId}/book-seat/`, { seat_id: seat.id });


        // On success, update the local state to mark the seat as booked.
        setBookedSeatIds((prev) => ({
          ...prev,
          [scheduleId]: [...(prev[scheduleId] || []), seat.id],
        }));
        setSelectedSeat(null);
      } catch (error) {
        console.error('Error booking seat:', error);
        // Optionally, display an error message to the user.
      }
    }
  };

  // Cancel the seat selection
  const cancelSeatBooking = () => {
    setSelectedSeat(null);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-900 dark:to-teal-800">
        <p className="text-xl text-blue-500">Loading schedules...</p>
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-900 dark:to-teal-800">
        <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      </div>
    );
  }
  if (schedules.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-900 dark:to-teal-800 p-8">
        <p className="text-xl text-gray-800 dark:text-gray-200">
          No schedules found for this route.
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

  // Use the route details from the first schedule to display a professional header
  const { origin, destination, estimated_duration } = schedules[0].route_details;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-900 dark:to-teal-800 p-8">
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
          {origin} to {destination}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Estimated Duration: {estimated_duration}
        </p>
      </header>

      {/* Schedules List */}
      <div className="grid gap-6">
        {schedules.map((schedule) => {
          // Get already booked seat ids for this schedule from our local state
          const scheduleBooked = bookedSeatIds[schedule.id] || [];
          return (
            <Card key={schedule.id} className="border-l-8 border-blue-500">
              {/* Schedule Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {origin} to {destination}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(schedule.departure_time).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Schedule Details */}
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
              <div className="flex flex-wrap gap-8 mb-4">
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

              {/* Bus Seat Layout */}
              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Bus Seat Layout
                </h3>
                {/* Adjust grid columns as needed to resemble a bus layout */}
                <div className="grid grid-cols-4 gap-2">
                  {schedule.seats.map((seat) => {
                    // Determine if the seat is already booked locally or by the API
                    const isBooked = !seat.is_available || (bookedSeatIds[schedule.id] || []).includes(seat.id);
                    // Determine if the seat is currently selected (awaiting confirmation)
                    const isSelected =
                      selectedSeat &&
                      selectedSeat.scheduleId === schedule.id &&
                      selectedSeat.seat.id === seat.id;
                    return (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(schedule.id, seat)}
                        className={`w-10 h-10 flex items-center justify-center rounded border text-xs font-medium transition-colors
                          ${isBooked ? 'bg-red-500 text-white cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}
                          ${isSelected ? 'ring-4 ring-blue-400' : ''}
                        `}
                      >
                        {seat.seat_number}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  * Click a green seat to select it.
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Seat Booking Confirmation Modal */}
      {selectedSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full mx-4 p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Confirm Seat Booking
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Do you want to book seat{' '}
              <span className="font-bold">{selectedSeat.seat.seat_number}</span> on this bus?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelSeatBooking}
                className="py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSeatBooking}
                className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Book Seat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
