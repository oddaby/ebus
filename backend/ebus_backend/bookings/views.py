from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from .models import Booking, BookingSeat, Passenger
from .serializers import BookingSerializer, PassengerSerializer
from buses.models import Schedule, Seat

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Booking.objects.all().select_related(
                'user', 'schedule'
            ).prefetch_related('booked_seats', 'passengers')
        return Booking.objects.filter(user=user).select_related(
            'user', 'schedule'
        ).prefetch_related('booked_seats', 'passengers')

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status == 'confirmed':
            booking.status = 'cancelled'
            booking.save()
            # Release the seats
            for seat in booking.seats.all():
                seat.is_available = True
                seat.save()
            return Response({'status': 'booking cancelled'})
        return Response(
            {'error': 'Cannot cancel this booking'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def add_passenger(self, request, pk=None):
        booking = self.get_object()
        if booking.status != 'confirmed':
            return Response(
                {'error': 'Cannot add passengers to non-confirmed booking'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = PassengerSerializer(data=request.data)
        if serializer.is_valid():
            # Find an unassigned seat
            unassigned_seats = BookingSeat.objects.filter(
                booking=booking,
                passenger__isnull=True
            ).first()
            
            if not unassigned_seats:
                return Response(
                    {'error': 'No available seats in this booking'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            passenger = serializer.save(
                booking=booking,
                seat=unassigned_seats
            )
            return Response(
                PassengerSerializer(passenger).data,
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        queryset = self.get_queryset().filter(
            schedule__departure_time__gt=timezone.now(),
            status='confirmed'
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def past(self, request):
        queryset = self.get_queryset().filter(
            schedule__departure_time__lt=timezone.now()
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response(
                {'error': 'Search query is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.get_queryset().filter(
            Q(passengers__full_name__icontains=query) |
            Q(schedule__source__icontains=query) |
            Q(schedule__destination__icontains=query)
        ).distinct()
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def seats(self, request, pk=None):
        booking = self.get_object()
        seats_data = [{
            'seat_number': bs.seat.seat_number,
            'passenger': bs.passenger.full_name if bs.passenger else None
        } for bs in booking.booked_seats.all()]
        return Response(seats_data)

    def destroy(self, request, *args, **kwargs):
        booking = self.get_object()
        if booking.status == 'confirmed' and \
           booking.schedule.departure_time > timezone.now():
            return super().destroy(request, *args, **kwargs)
        return Response(
            {'error': 'Cannot delete this booking'},
            status=status.HTTP_400_BAD_REQUEST
        )