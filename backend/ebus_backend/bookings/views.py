# views.py
from rest_framework import viewsets, status, views
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Booking, Seat
from .serializers import BookingSerializer
from buses.models import Schedule

from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Booking
from .serializers import BookingSerializer

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    def create(self, request, *args, **kwargs):
        # Add schedule ID from URL if not provided
        request.data.setdefault('schedule', self.kwargs.get('schedule_id'))
        return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)