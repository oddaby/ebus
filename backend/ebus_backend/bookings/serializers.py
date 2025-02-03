# serializers.py
from rest_framework import serializers
from buses.models import Schedule, Seat

from rest_framework import serializers
from .models import Booking, BookedSeat
from buses.models import Seat

class BookedSeatSerializer(serializers.ModelSerializer):
    seat_number = serializers.CharField(source='seat.seat_number', read_only=True)
    seat_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = BookedSeat
        fields = ['seat_id', 'seat_number', 'passenger_name', 'passenger_age', 'passenger_gender']

class BookingSerializer(serializers.ModelSerializer):
    seats = BookedSeatSerializer(many=True, source='seats')

    class Meta:
        model = Booking
        fields = ['id', 'schedule', 'full_name', 'total_fare', 'booking_time', 'status', 'seats']
        read_only_fields = ['total_fare', 'booking_time', 'status']

    def validate(self, data):
        seats_data = data.get('seats', [])
        schedule = data.get('schedule')

        # Validate seat availability
        for seat_data in seats_data:
            seat_id = seat_data.get('seat_id')
            try:
                seat = Seat.objects.get(id=seat_id, schedule=schedule)
                if not seat.is_available:
                    raise serializers.ValidationError(f"Seat {seat.seat_number} is already booked")
            except Seat.DoesNotExist:
                raise serializers.ValidationError(f"Invalid seat ID: {seat_id}")

        return data

    def create(self, validated_data):
        seats_data = validated_data.pop('seats')
        booking = Booking.objects.create(**validated_data)
        
        total_fare = 0
        for seat_data in seats_data:
            seat = Seat.objects.get(id=seat_data['seat_id'])
            BookedSeat.objects.create(
                booking=booking,
                seat=seat,
                passenger_name=seat_data['passenger_name'],
                passenger_age=seat_data['passenger_age'],
                passenger_gender=seat_data['passenger_gender']
            )
            total_fare += booking.schedule.fare
        
        booking.total_fare = total_fare
        booking.save()
        return booking