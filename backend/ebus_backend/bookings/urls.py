from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet

# Create a router and register the BookingViewSet
router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    path('', include(router.urls)),  # Include all the routes from the router
    path('', include(router.urls)),
    path('bookings/<int:pk>/', BookingViewSet.as_view({'get': 'retrieve'}), name='booking-detail'),

]
