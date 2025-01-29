import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../store/slices/authSlice';
import { EnvelopeIcon, LockClosedIcon, PhoneIcon, UserCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone_number: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [formProgress, setFormProgress] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
        first_name: formData.first_name,
        last_name: formData.last_name
      };

      await dispatch(register(registrationData)).unwrap();
      navigate('/login');
    } catch (err) {
      if (err.response?.data) {
        const errors = Object.entries(err.response.data)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        setError(errors);
      } else {
        setError('Registration failed. Please check your information.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Calculate form progress
    const filledFields = Object.values(formData).filter(val => val.length > 0).length;
    setFormProgress((filledFields / 5) * 100);
  };

  const inputClasses = (fieldName) => `
    w-full rounded-2xl border bg-white/80 px-4 py-4 pl-12
    text-sm transition-all duration-300
    ${focusedField === fieldName 
      ? 'border-transparent bg-white shadow-[inset_0_0_0_2px_#4F46E5,_0_0_0_4px_#E0E7FF]' 
      : 'border-transparent shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]'
    }
    hover:bg-white focus:outline-none focus:border-transparent
    backdrop-blur-sm
  `;

  const iconClasses = (fieldName) => `
    h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2
    transition-all duration-300
    ${focusedField === fieldName 
      ? 'text-indigo-600' 
      : 'text-gray-400'
    }
  `;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-200 via-slate-100 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Progress bar */}
        <div className="h-1 w-full bg-gray-200 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${formProgress}%` }}
          />
        </div>

        <div className="space-y-8 bg-white/30 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50">
          <div className="text-center relative">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center rotate-12 shadow-xl">
                <div className="-rotate-12">
                  <UserCircleIcon className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-4xl font-bold mt-8 bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Join Us
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                Sign in
              </a>
            </p>
          </div>

          {error && (
            <div className="bg-red-50/50 backdrop-blur-sm border border-red-100 text-red-700 p-4 rounded-2xl text-sm animate-fade-in">
              <p className="font-medium">Registration failed</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email */}
              <div className="relative group">
                <EnvelopeIcon className={iconClasses('email')} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={inputClasses('email')}
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <LockClosedIcon className={iconClasses('password')} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={inputClasses('password')}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                />
              </div>

              {/* Phone Number */}
              <div className="relative group">
                <PhoneIcon className={iconClasses('phone_number')} />
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  autoComplete="tel"
                  required
                  className={inputClasses('phone_number')}
                  placeholder="Phone number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('phone_number')}
                  onBlur={() => setFocusedField('')}
                />
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <UserCircleIcon className={iconClasses('first_name')} />
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    autoComplete="given-name"
                    required
                    className={inputClasses('first_name')}
                    placeholder="First name"
                    value={formData.first_name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('first_name')}
                    onBlur={() => setFocusedField('')}
                  />
                </div>

                <div className="relative group">
                  <UserCircleIcon className={iconClasses('last_name')} />
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    autoComplete="family-name"
                    required
                    className={inputClasses('last_name')}
                    placeholder="Last name"
                    value={formData.last_name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('last_name')}
                    onBlur={() => setFocusedField('')}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`
                group w-full py-4 px-4 rounded-2xl font-medium text-white
                transition-all duration-300 relative overflow-hidden
                ${isLoading 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:to-purple-500'
                }
                shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30
              `}
            >
              <span className={`
                flex items-center justify-center gap-2
                transition-all duration-300
                ${isLoading ? 'opacity-0' : 'group-hover:translate-x-1'}
              `}>
                Create Account
                <ArrowRightIcon className="h-4 w-4" />
              </span>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}