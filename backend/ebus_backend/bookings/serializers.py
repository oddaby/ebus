from rest_framework import serializers
from buses.models import Seat
from .models import Booking, Passenger

class PassengerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passenger
        fields = ['full_name', 'age', 'gender']

class BookingCreateSerializer(serializers.ModelSerializer):
    passengers = PassengerSerializer(many=True)
    seat_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True
    )

    class Meta:
        model = Booking
        fields = ['schedule', 'seat_ids', 'passengers']
        extra_kwargs = {'schedule': {'required': True}}

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'
        depth = 2