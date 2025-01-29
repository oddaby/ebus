from rest_framework import serializers
from .models import Route, Bus, Schedule, Seat

class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = ['id', 'origin', 'destination', 'distance', 'estimated_duration']

    def validate(self, data):
        if data.get('origin') == data.get('destination'):
            raise serializers.ValidationError(
                "Origin and destination cannot be the same"
            )
        return data

class BusSerializer(serializers.ModelSerializer):
    bus_type_display = serializers.CharField(
        source='get_bus_type_display',
        read_only=True
    )
    amenities_list = serializers.SerializerMethodField()

    class Meta:
        model = Bus
        fields = ['id', 'bus_number', 'bus_type', 'bus_type_display',
                 'capacity', 'amenities', 'amenities_list']

    def get_amenities_list(self, obj):
        if obj.amenities:
            return [item.strip() for item in obj.amenities.split(',')]
        return []

class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ['id', 'seat_number', 'is_available']

class ScheduleSerializer(serializers.ModelSerializer):
    route_details = RouteSerializer(source='route', read_only=True)
    bus_details = BusSerializer(source='bus', read_only=True)
    available_seats_count = serializers.SerializerMethodField()
    seats = SeatSerializer(many=True, read_only=True)
    duration = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = ['id', 'route', 'bus', 'route_details', 'bus_details',
                 'departure_time', 'arrival_time', 'fare', 'seats',
                 'available_seats_count', 'duration']

    def get_available_seats_count(self, obj):
        return obj.seats.filter(is_available=True).count()

    def get_duration(self, obj):
        return (obj.arrival_time - obj.departure_time).total_seconds() / 3600

    def validate(self, data):
        if data.get('arrival_time') <= data.get('departure_time'):
            raise serializers.ValidationError(
                "Arrival time must be after departure time"
            )
        
        # Check if bus is available for the scheduled time
        bus = data.get('bus')
        departure_time = data.get('departure_time')
        arrival_time = data.get('arrival_time')
        
        conflicting_schedules = Schedule.objects.filter(
            bus=bus,
            departure_time__lt=arrival_time,
            arrival_time__gt=departure_time
        )
        
        if self.instance:
            conflicting_schedules = conflicting_schedules.exclude(
                pk=self.instance.pk
            )
            
        if conflicting_schedules.exists():
            raise serializers.ValidationError(
                "Bus is already scheduled during this time period"
            )
            
        return data

class ScheduleListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    route_display = serializers.StringRelatedField(source='route')
    bus_display = serializers.StringRelatedField(source='bus')
    available_seats = serializers.IntegerField(
        source='seats.filter(is_available=True).count'
    )

    class Meta:
        model = Schedule
        fields = ['id', 'route_display', 'bus_display', 'departure_time',
                 'arrival_time', 'fare', 'available_seats']