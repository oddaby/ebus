import React, { useState } from 'react';
import { MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';

const SearchForm = ({ searchParams, setSearchParams }) => {
  const [focusedField, setFocusedField] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Origin Input */}
        <div className="relative group">
          <div className={`absolute inset-0 rounded-xl transition-all ${
            focusedField === 'origin' ? 'bg-primary/10 ring-2 ring-primary/20' : 'bg-transparent'
          }`}></div>
          <div className="relative">
            <label className={`absolute left-4 transition-all duration-200 ${
              focusedField === 'origin' || searchParams.origin 
                ? 'top-2 text-xs text-primary'
                : 'top-4 text-sm text-gray-400'
            }`}>
              From
            </label>
            <MapPinIcon className={`h-5 w-5 absolute right-4 top-4 transition-colors ${
              focusedField === 'origin' ? 'text-primary' : 'text-gray-400'
            }`} />
            <input
              name="origin"
              className="w-full pt-6 pb-2 px-4 bg-transparent rounded-xl border-0 focus:ring-0 text-gray-800 placeholder-transparent"
              value={searchParams.origin}
              onChange={handleInputChange}
              onFocus={() => setFocusedField('origin')}
              onBlur={() => setFocusedField(null)}
            />
          </div>
        </div>

        {/* Destination Input */}
        <div className="relative group">
          <div className={`absolute inset-0 rounded-xl transition-all ${
            focusedField === 'destination' ? 'bg-primary/10 ring-2 ring-primary/20' : 'bg-transparent'
          }`}></div>
          <div className="relative">
            <label className={`absolute left-4 transition-all duration-200 ${
              focusedField === 'destination' || searchParams.destination 
                ? 'top-2 text-xs text-primary'
                : 'top-4 text-sm text-gray-400'
            }`}>
              To
            </label>
            <MapPinIcon className={`h-5 w-5 absolute right-4 top-4 transition-colors ${
              focusedField === 'destination' ? 'text-primary' : 'text-gray-400'
            }`} />
            <input
              name="destination"
              className="w-full pt-6 pb-2 px-4 bg-transparent rounded-xl border-0 focus:ring-0 text-gray-800 placeholder-transparent"
              value={searchParams.destination}
              onChange={handleInputChange}
              onFocus={() => setFocusedField('destination')}
              onBlur={() => setFocusedField(null)}
            />
          </div>
        </div>

        {/* Date Input */}
        <div className="relative group">
          <div className={`absolute inset-0 rounded-xl transition-all ${
            focusedField === 'date' ? 'bg-primary/10 ring-2 ring-primary/20' : 'bg-transparent'
          }`}></div>
          <div className="relative">
            <label className={`absolute left-4 transition-all duration-200 ${
              focusedField === 'date' || searchParams.date 
                ? 'top-2 text-xs text-primary'
                : 'top-4 text-sm text-gray-400'
            }`}>
              Date
            </label>
            <CalendarIcon className={`h-5 w-5 absolute right-4 top-4 transition-colors ${
              focusedField === 'date' ? 'text-primary' : 'text-gray-400'
            }`} />
            <input
              type="date"
              name="date"
              className="w-full pt-6 pb-2 px-4 bg-transparent rounded-xl border-0 focus:ring-0 text-gray-800 appearance-none"
              value={searchParams.date}
              onChange={handleInputChange}
              onFocus={() => setFocusedField('date')}
              onBlur={() => setFocusedField(null)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setSearchParams({
          origin: '',
          destination: '',
          date: new Date().toISOString().split('T')[0]
        })}
        className="mt-4 flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        Reset Filters
      </button>
    </div>
  );
};

export default SearchForm;