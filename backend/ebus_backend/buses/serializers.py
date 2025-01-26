from rest_framework import serializers
from .models import Route, Bus, Schedule, Seat

class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = '__all__'

class BusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus
        fields = '__all__'

class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = '__all__'
        depth = 1

class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ['id', 'seat_number', 'is_available']

class SeatAvailabilitySerializer(serializers.Serializer):
    schedule_id = serializers.IntegerField()
    date = serializers.DateField()