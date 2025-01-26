from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    RouteViewSet,
    BusViewSet,
    ScheduleViewSet,
    SeatAvailabilityView
)

router = DefaultRouter()
router.register(r'routes', RouteViewSet, basename='route')
router.register(r'buses', BusViewSet, basename='bus')
router.register(r'schedules', ScheduleViewSet, basename='schedule')

urlpatterns = [
    path('seats/availability/', SeatAvailabilityView.as_view(), name='seat-availability'),
]

urlpatterns += router.urls