from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    BookingViewSet,
    PassengerViewSet,
    CancelBookingView
)

router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'passengers', PassengerViewSet, basename='passenger')

urlpatterns = [
    path('bookings/<int:pk>/cancel/', CancelBookingView.as_view(), name='cancel-booking'),
]

urlpatterns += router.urls