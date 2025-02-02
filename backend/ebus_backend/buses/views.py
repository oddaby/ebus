from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from .models import Route, Bus, Schedule, Seat
from .serializers import RouteSerializer, BusSerializer, ScheduleSerializer, SeatSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Seat
from .serializers import SeatSerializer

class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['get'])
    def schedules(self, request, pk=None):
        route = self.get_object()
        schedules = Schedule.objects.filter(
            route=route,
            departure_time__gte=timezone.now()
        )
        serializer = ScheduleSerializer(schedules, many=True)
        return Response(serializer.data)

class BusViewSet(viewsets.ModelViewSet):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['get'])
    def schedules(self, request, pk=None):
        bus = self.get_object()
        schedules = Schedule.objects.filter(
            bus=bus,
            departure_time__gte=timezone.now()
        )
        serializer = ScheduleSerializer(schedules, many=True)
        return Response(serializer.data)

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Schedule.objects.all()
        origin = self.request.query_params.get('origin', None)
        destination = self.request.query_params.get('destination', None)
        date = self.request.query_params.get('date', None)

        if origin and destination:
            queryset = queryset.filter(
                route__origin__iexact=origin,
                route__destination__iexact=destination
            )
        if date:
            queryset = queryset.filter(departure_time__date=date)

        return queryset

    @action(detail=True, methods=['get'])
    def seats(self, request, pk=None):
        schedule = self.get_object()
        seats = schedule.seats.all()
        serializer = SeatSerializer(seats, many=True)
        return Response(serializer.data)

class SeatViewSet(viewsets.ModelViewSet):
    queryset = Seat.objects.all()
    serializer_class = SeatSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Seat.objects.all()
        schedule_id = self.request.query_params.get('schedule', None)
        if schedule_id:
            queryset = queryset.filter(schedule_id=schedule_id)
        return queryset
    




class BookSeatView(APIView):
    def post(self, request, schedule_id):
        seat_id = request.data.get("seat_id")
        try:
            seat = Seat.objects.get(id=seat_id, schedule_id=schedule_id, is_available=True)
            seat.is_available = False
            seat.save()
            return Response({"message": "Seat booked successfully!"}, status=status.HTTP_200_OK)
        except Seat.DoesNotExist:
            return Response({"error": "Seat not available"}, status=status.HTTP_400_BAD_REQUEST)
