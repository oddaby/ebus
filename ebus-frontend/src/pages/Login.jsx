import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { Mail, Lock, AlertCircle, Loader, Eye, EyeOff, Check, X } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await dispatch(login(formData)).unwrap();
      // Success animation before navigation
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="relative w-full max-w-md">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 transform rotate-12 rounded-3xl blur-3xl animate-pulse" />
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/5 to-blue-500/5 transform -rotate-12 rounded-3xl blur-2xl" />
        
        <div className="relative backdrop-blur-sm bg-white/90 p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-200/50 transition-all duration-300">
          {/* Animated Logo */}
          <div className="mb-10 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform hover:rotate-12 transition-transform cursor-pointer">
              <span className="text-3xl text-white font-bold">E·B</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="mt-2 text-gray-600">Sign in to continue to E-Bus</p>
          </div>

          {/* Error Message with animation */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-xl flex items-center space-x-2 text-red-600 animate-shake">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
              <button 
                onClick={() => setError('')}
                className="ml-auto hover:bg-red-100 p-1 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div className="group relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" />
                <input
                  type="email"
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                {formData.email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {validateEmail(formData.email) ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="group relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <div className={`w-4 h-4 border rounded transition-all ${
                    rememberMe ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                  }`}>
                    {rememberMe && <Check className="w-3 h-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                  </div>
                </div>
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a href="/forgot-password" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !validateEmail(formData.email)}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/25 active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Social Login Section */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 text-gray-500 bg-white">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all hover:shadow-md"
              >
                <img src="/google.svg" alt="Google" className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all hover:shadow-md"
              >
                <img src="/apple.svg" alt="Apple" className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all hover:shadow-md"
              >
                <img src="/facebook.svg" alt="Facebook" className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Register Link */}
          <p className="mt-8 text-center text-gray-600">
            Don't have an account?{' '}
            <a
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors hover:underline"
            >
              Create one now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}