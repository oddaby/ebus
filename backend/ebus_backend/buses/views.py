from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Route, Bus, Schedule, Seat
from .serializers import (
    RouteSerializer, BusSerializer,
    ScheduleSerializer, SeatSerializer,
    SeatAvailabilitySerializer
)
from django.utils import timezone
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser

class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()

class BusViewSet(viewsets.ModelViewSet):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAdminUser]

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params
        
        if 'route_id' in params:
            queryset = queryset.filter(route_id=params['route_id'])
        if 'date' in params:
            queryset = queryset.filter(departure_time__date=params['date'])
            
        return queryset

class SeatAvailabilityView(APIView):
    def get(self, request):
        serializer = SeatAvailabilitySerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
            
        schedule_id = serializer.validated_data['schedule_id']
        date = serializer.validated_data['date']
        
        seats = Seat.objects.filter(
            schedule_id=schedule_id,
            is_available=True
        )
        serializer = SeatSerializer(seats, many=True)
        return Response(serializer.data)