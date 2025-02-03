from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet

# Create a router and register the BookingViewSet
router = DefaultRouter()

router.register(r'schedules/(?P<schedule_id>\d+)/bookings', BookingViewSet, basename='schedule-bookings')

urlpatterns = [
    path('', include(router.urls)),
]