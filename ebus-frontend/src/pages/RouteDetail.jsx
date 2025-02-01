import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRouteById,
  selectSelectedRoute,
  selectSelectedRouteStatus,
  selectSelectedRouteError,
} from '../store/slices/routeSlice';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Navigation,
  DollarSign,
  Calendar,
  Users,
  MapPin,
  Box,
  Map,
  AlertTriangle,
  Info,
  BarChart,
  Star,
} from 'lucide-react';

// Card component replacement
const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="p-6 border-b border-gray-200 dark:border-gray-800">{children}</div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-xl font-semibold ${className}`}>{children}</h3>
);

const CardContent = ({ children }) => <div className="p-6">{children}</div>;

// Alert component replacement
const Alert = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    destructive: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
  };

  return (
    <div className={`p-4 rounded-lg flex items-center space-x-2 ${variants[variant]}`}>
      {children}
    </div>
  );
};

const RouteDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  // State to show the booking confirmation modal
  const [showBookingModal, setShowBookingModal] = useState(false);

  const route = useSelector(selectSelectedRoute);
  const status = useSelector(selectSelectedRouteStatus);
  const error = useSelector(selectSelectedRouteError);

  useEffect(() => {
    if (!route && id) {
      dispatch(fetchRouteById(id));
    }
  }, [dispatch, id, route]);

  // Open the custom modal on clicking "Book Now"
  const handleBookNow = () => {
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    setShowBookingModal(false);
    navigate(`/buses/schedules/`);
  };

  const cancelBooking = () => {
    setShowBookingModal(false);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto p-8">
          <div className="flex items-center justify-center space-x-2">
            <Navigation className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-xl text-blue-500">Loading route details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto p-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </Alert>
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto p-8">
          <Alert>
            <Info className="h-4 w-4" />
            <span>Route not found</span>
          </Alert>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'statistics', label: 'Statistics', icon: BarChart },
    { id: 'reviews', label: 'Reviews', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
      {/* Navigation Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/20 sticky top-0 z-10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Routes</span>
            </button>
            <div className="text-sm text-gray-500">Route ID: {id}</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Route Overview Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {route.name || 'Route Details'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl p-6 mb-6">
              <div className="flex items-center space-x-4">
                <MapPin className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Origin</p>
                  <span className="text-xl font-medium">{route.origin}</span>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-blue-500" />
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Destination</p>
                  <span className="text-xl font-medium">{route.destination}</span>
                </div>
                <MapPin className="w-6 h-6 text-blue-500" />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <DetailCard
                icon={<Clock />}
                title="Duration"
                value={route.estimated_duration || 'N/A'}
              />
              <DetailCard
                icon={<DollarSign />}
                title="Fare"
                value={
                  route.base_fare || route.price
                    ? `$${route.base_fare || route.price}`
                    : 'N/A'
                }
              />
              <DetailCard
                icon={<Users />}
                title="Available Seats"
                value={route.available_seats || 'N/A'}
              />
              <DetailCard
                icon={<Box />}
                title="Cargo Space"
                value={route.cargo_capacity || 'N/A'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="flex space-x-8">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'overview' && (
              <Card>
                <CardHeader>
                  <CardTitle>Route Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
                        <h3 className="font-medium mb-2">Departure</h3>
                        <p className="text-lg">{route.departure_time || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{route.origin}</p>
                      </div>
                      <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
                        <h3 className="font-medium mb-2">Arrival</h3>
                        <p className="text-lg">{route.arrival_time || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{route.destination}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
                      <h3 className="font-medium mb-2">Route Description</h3>
                      <p>{route.description || 'No description available.'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'schedule' && (
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
                      <h3 className="font-medium mb-2">Frequency</h3>
                      <p>{route.frequency || 'Schedule information not available.'}</p>
                    </div>
                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
                      <h3 className="font-medium mb-2">Stops</h3>
                      <div className="space-y-2">
                        {(route.stops || ['No stops information available.']).map((stop, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span>{stop}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'statistics' && (
              <Card>
                <CardHeader>
                  <CardTitle>Route Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
                      <h3 className="font-medium mb-2">Performance Metrics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">On-Time Performance</p>
                          <p className="text-lg font-medium">{route.onTimePerformance || '95%'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Average Occupancy</p>
                          <p className="text-lg font-medium">{route.averageOccupancy || '82%'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'reviews' && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(route.reviews || [
                      { rating: 5, comment: 'Great route, very comfortable journey!', author: 'John D.' },
                      { rating: 4, comment: 'Good service, slightly delayed.', author: 'Sarah M.' },
                    ]).map((review, index) => (
                      <div key={index} className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
                        <div className="flex items-center space-x-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="mb-2">{review.comment}</p>
                        <p className="text-sm text-gray-500">- {review.author}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <button
                    className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={handleBookNow}
                  >
                    <MapPin className="w-5 h-5" />
                    <span>Book Now</span>
                  </button>
                  <button className="w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    Download Schedule
                  </button>
                  <button className="w-full py-2 px-4 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Share Route
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weather Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-center text-sm text-gray-500">
                    Weather information for this route is currently not available.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Route Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50/50 dark:bg-green-900/20 rounded-xl">
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Route operating normally
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Enhanced Booking Confirmation Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full mx-4 border-l-8 border-blue-500">
            <div className="p-6">
              <div className="flex items-center">
                <Info className="w-6 h-6 text-blue-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Confirm Booking
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                Are you sure you want to book Route {id}?
              </p>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={cancelBooking}
                  className="flex items-center space-x-2 py-2 px-4 border border-gray-300 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={confirmBooking}
                  className="flex items-center space-x-2 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Confirm</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-900/80 border-t border-gray-200/20 mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} Transit System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper component for detail cards
const DetailCard = ({ icon, title, value }) => (
  <div className="p-4 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl backdrop-blur-sm border border-gray-200/20">
    <div className="flex items-center space-x-3">
      <div className="text-blue-500">{icon}</div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="font-semibold text-gray-800 dark:text-gray-200">{value}</p>
      </div>
    </div>
  </div>
);

// Helper component for rendering maps (placeholder)
const RouteMap = ({ origin, destination }) => (
  <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 h-64 flex items-center justify-center">
    <div className="text-center text-gray-500 dark:text-gray-400">
      <Map className="w-8 h-8 mx-auto mb-2" />
      <p>Interactive map showing route from {origin} to {destination}</p>
    </div>
  </div>
);

// Helper function to format time
const formatTime = (time) => {
  if (!time) return 'N/A';
  try {
    return new Date(time).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return time;
  }
};

export { DetailCard, RouteMap, formatTime };
export default RouteDetails;
