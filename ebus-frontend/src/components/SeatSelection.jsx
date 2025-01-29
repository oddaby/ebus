import React from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedSeats } from '../store/slices/bookingSlice';

const SeatSelection = ({ seats }) => {
  const dispatch = useDispatch();

  const handleSeatClick = (seat) => {
    if (seat.is_available) {
      dispatch(setSelectedSeats(seat.id));
    }
  };

  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-4 p-4 bg-gray-50 rounded-lg">
      {seats.map(seat => (
        <button
          key={seat.id}
          onClick={() => handleSeatClick(seat)}
          className={`h-12 w-12 rounded-lg flex items-center justify-center text-sm font-medium
            ${seat.is_available ?
              'bg-green-100 hover:bg-green-200 text-green-800' :
              'bg-red-100 text-red-800 cursor-not-allowed'}
            border-2 ${seat.is_selected ? 'border-primary border-4' : 'border-transparent'}
          `}
          disabled={!seat.is_available}
        >
          {seat.seat_number}
        </button>
      ))}
    </div>
  );
};

export default SeatSelection;