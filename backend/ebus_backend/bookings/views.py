from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Booking, Passenger
from .serializers import BookingSerializer, BookingCreateSerializer, PassengerSerializer
from buses.models import Seat
from rest_framework.permissions import IsAuthenticated

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Booking, Passenger
from .serializers import BookingSerializer, BookingCreateSerializer, PassengerSerializer
from buses.models import Seat
from rest_framework.permissions import IsAuthenticated

# Add this new ViewSet
class PassengerViewSet(viewsets.ModelViewSet):
    serializer_class = PassengerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Passenger.objects.filter(booking__user=self.request.user)

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)

    def create(self, request):
        serializer = BookingCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Get selected seats
            seats = Seat.objects.filter(
                id__in=serializer.validated_data['seat_ids'],
                is_available=True
            )
            
            if len(seats) != len(serializer.validated_data['seat_ids']):
                return Response({'error': 'Some seats are no longer available'}, status=400)
                
            # Create booking
            booking = Booking.objects.create(
                user=request.user,
                schedule=serializer.validated_data['schedule'],
                total_fare=serializer.validated_data['schedule'].route.base_fare * len(seats)
            )
            
            # Add passengers
            passengers = [
                Passenger(booking=booking, **passenger_data)
                for passenger_data in serializer.validated_data['passengers']
            ]
            Passenger.objects.bulk_create(passengers)
            
            # Update seats
            seats.update(is_available=False)
            booking.seats.set(seats)
            
            return Response(BookingSerializer(booking).data, status=201)
            
        return Response(serializer.errors, status=400)

class CancelBookingView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk, user=request.user)
            if booking.status == 'cancelled':
                return Response({'message': 'Booking already cancelled'}, status=400)
                
            booking.status = 'cancelled'
            booking.save()
            
            # Release seats
            booking.seats.update(is_available=True)
            
            return Response({'message': 'Booking cancelled successfully'})
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=404)