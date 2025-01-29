from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RouteViewSet,
    BusViewSet,
    ScheduleViewSet,
    SeatViewSet
)

router = DefaultRouter()
router.register(r'routes', RouteViewSet)
router.register(r'buses', BusViewSet)
router.register(r'schedules', ScheduleViewSet)
router.register(r'seats', SeatViewSet)

urlpatterns = [
    path('', include(router.urls)),
]