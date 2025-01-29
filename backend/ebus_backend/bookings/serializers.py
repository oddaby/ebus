from rest_framework import serializers
from .models import Booking, Passenger, BookingSeat
from buses.models import Schedule, Seat

class PassengerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passenger
        fields = ['id', 'full_name', 'age', 'gender', 'seat', 'booking']
        read_only_fields = ['seat']

class BookingSeatSerializer(serializers.ModelSerializer):
    seat_number = serializers.CharField(source='seat.seat_number', read_only=True)

    class Meta:
        model = BookingSeat
        fields = ['id', 'seat', 'seat_number', 'booked_at']
        read_only_fields = ['booked_at']

class BookingSerializer(serializers.ModelSerializer):
    passengers = PassengerSerializer(many=True, required=False)
    booked_seats = BookingSeatSerializer(many=True, read_only=True)
    seats = serializers.PrimaryKeyRelatedField(
        queryset=Seat.objects.all(),
        many=True,
        write_only=True
    )
    user_email = serializers.EmailField(source='user.email', read_only=True)
    schedule_details = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'schedule', 'schedule_details', 'seats',
            'booked_seats', 'total_fare', 'booking_time', 'status',
            'passengers', 'user_email'
        ]
        read_only_fields = ['user', 'total_fare', 'booking_time', 'status']

    def get_schedule_details(self, obj):
        return {
            'departure_time': obj.schedule.departure_time,
            'arrival_time': obj.schedule.arrival_time,
            'source': obj.schedule.source,
            'destination': obj.schedule.destination,
            'fare': str(obj.schedule.fare)
        }

    def validate_seats(self, seats):
        schedule = self.initial_data.get('schedule')
        if not all(seat.schedule_id == schedule for seat in seats):
            raise serializers.ValidationError(
                "All seats must belong to the selected schedule"
            )
        if not all(seat.is_available for seat in seats):
            raise serializers.ValidationError(
                "One or more selected seats are not available"
            )
        return seats