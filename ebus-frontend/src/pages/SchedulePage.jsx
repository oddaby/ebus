import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  User,
  Ticket,
  AlertTriangle,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../services/api';
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
  const [bookedSeatIds, setBookedSeatIds] = useState({});
  const [passengerDetails, setPassengerDetails] = useState({
    fullName: '',
    age: '',
    gender: 'male',
  });

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
  const handleSeatClick = (schedule, seat) => {
    const scheduleBooked = bookedSeatIds[schedule.id] || [];
    if (seat.is_available && !scheduleBooked.includes(seat.id)) {
      setSelectedSeat({ schedule, seat });
    }
  };

  // Confirm booking of selected seat and update the backend
  const confirmSeatBooking = async () => {
    if (!selectedSeat || !passengerDetails.fullName || !passengerDetails.age) return;

    try {
      const bookingData = {
        schedule_id: selectedSeat.schedule.id,
        seat_id: selectedSeat.seat.id,
        passenger: passengerDetails,
      };

      // Create complete booking record
      const response = await api.post('bookings/bookings/', bookingData);

      // Refresh data and state
      dispatch(fetchSchedules());
      setBookedSeatIds((prev) => ({
        ...prev,
        [selectedSeat.schedule.id]: [...(prev[selectedSeat.schedule.id] || []), selectedSeat.seat.id],
      }));

      // Show transaction confirmation
      alert(`Booking confirmed! Ksh ${selectedSeat.schedule.fare} has been deducted from your account.`);

      // Reset states
      setSelectedSeat(null);
      setPassengerDetails({ fullName: '', age: '', gender: 'male' });
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
    }
  };

  // Cancel the seat selection
  const cancelSeatBooking = () => {
    setSelectedSeat(null);
    setPassengerDetails({ fullName: '', age: '', gender: 'male' });
  };

  // Render bus seat layout
  const renderBusLayout = (schedule, scheduleBooked) => {
    // Group seats into rows (4 seats per row: 2 left, 2 right)
    const rows = [];
    const seats = [...schedule.seats].sort((a, b) => a.seat_number.localeCompare(b.seat_number));
    
    for (let i = 0; i < seats.length; i += 4) {
      const rowSeats = seats.slice(i, i + 4);
      rows.push({
        left: rowSeats.slice(0, 2),
        right: rowSeats.slice(2, 4),
        rowNumber: Math.floor(i / 4) + 1
      });
    }

    return (
      <div className="mb-4">
        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Bus Seat Layout
        </h3>
        
        {/* Driver's Cabin Representation */}
        <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-center text-sm">
          Driver's Cabin
        </div>

        {/* Seat Rows */}
        <div className="space-y-4">
          {rows.map((row, index) => (
            <div key={index} className="grid grid-cols-5 gap-2 items-center">
              {/* Left Seats */}
              <div className="col-span-2 grid grid-cols-2 gap-2">
                {row.left.map((seat) => renderSeatButton(schedule, seat, scheduleBooked))}
              </div>

              {/* Aisle with Row Number */}
              <div className="col-span-1 flex flex-col items-center justify-center h-full">
                <div className="w-px h-full bg-gray-200 dark:bg-gray-600"></div>
                <span className="text-xs text-gray-500 mt-1">Row {row.rowNumber}</span>
              </div>

              {/* Right Seats */}
              <div className="col-span-2 grid grid-cols-2 gap-2">
                {row.right.map((seat) => renderSeatButton(schedule, seat, scheduleBooked))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 ring-4 ring-blue-400 rounded"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>
    );
  };

  // Extracted seat button component
  const renderSeatButton = (schedule, seat, scheduleBooked) => {
    const isBooked = !seat.is_available || scheduleBooked.includes(seat.id);
    const isSelected = selectedSeat?.schedule?.id === schedule.id && 
                      selectedSeat?.seat?.id === seat.id;

    return (
      <button
        key={seat.id}
        onClick={() => handleSeatClick(schedule, seat)}
        disabled={isBooked}
        className={`w-10 h-10 flex items-center justify-center rounded-lg border-2
          text-sm font-medium transition-all ${
            isBooked 
              ? 'bg-red-500 border-red-600 cursor-not-allowed' 
              : 'bg-green-500 border-green-600 hover:bg-green-600'
          } ${
            isSelected ? 'ring-4 ring-blue-400 scale-110' : ''
          }`}
        title={`Seat ${seat.seat_number}${isBooked ? ' (Booked)' : ''}`}
      >
        {seat.seat_number}
      </button>
    );
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

              {/* Bus Seat Layout */}
              {renderBusLayout(schedule, scheduleBooked)}
            </Card>
          );
        })}
      </div>

      {/* Seat Booking Confirmation Modal */}
      {selectedSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Confirm Booking Details
            </h2>

            {/* Trip Information */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Route:</span>
                <span className="font-medium">
                  {selectedSeat.schedule.route_details.origin} → 
                  {selectedSeat.schedule.route_details.destination}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Departure:</span>
                <span className="font-medium">
                  {new Date(selectedSeat.schedule.departure_time).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Seat:</span>
                <span className="font-medium">#{selectedSeat.seat.seat_number}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Fare:</span>
                <span className="font-medium text-green-600">
                  Ksh {selectedSeat.schedule.fare}
                </span>
              </div>
            </div>

            {/* Passenger Details Form */}
            <div className="space-y-4 mb-6">
              <h3 className="font-medium flex items-center gap-2">
                <User className="w-5 h-5" />
                Passenger Information
              </h3>
              
              <div>
                <label className="block text-sm mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded-md dark:bg-gray-700"
                  value={passengerDetails.fullName}
                  onChange={e => setPassengerDetails({...passengerDetails, fullName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Age</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full p-2 border rounded-md dark:bg-gray-700"
                    value={passengerDetails.age}
                    onChange={e => setPassengerDetails({...passengerDetails, age: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Gender</label>
                  <select
                    className="w-full p-2 border rounded-md dark:bg-gray-700"
                    value={passengerDetails.gender}
                    onChange={e => setPassengerDetails({...passengerDetails, gender: e.target.value})}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelSeatBooking}
                className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmSeatBooking}
                disabled={!passengerDetails.fullName || !passengerDetails.age}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                  ${!passengerDetails.fullName || !passengerDetails.age ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;