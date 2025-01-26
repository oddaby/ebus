from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Transaction
from bookings.models import Booking
from .serializers import PaymentInitiationSerializer, TransactionSerializer
import stripe

class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PaymentInitiationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
            
        try:
            booking = Booking.objects.get(
                id=serializer.validated_data['booking_id'],
                user=request.user
            )
            
            # Create transaction
            transaction = Transaction.objects.create(
                booking=booking,
                amount=booking.total_fare,
                payment_method=serializer.validated_data['payment_method']
            )
            
            # Payment gateway integration (example: Stripe)
            if serializer.validated_data['payment_method'] == 'card':
                stripe.api_key = "your_stripe_key"
                payment_intent = stripe.PaymentIntent.create(
                    amount=int(booking.total_fare * 100),
                    currency='usd',
                    metadata={
                        "transaction_id": transaction.id,
                        "booking_id": booking.id
                    }
                )
                return Response({
                    'client_secret': payment_intent.client_secret,
                    'transaction_id': transaction.id
                })
                
            # Handle other payment methods (M-Pesa, PayPal)
            return Response({'transaction_id': transaction.id})
            
        except Booking.DoesNotExist:
            return Response({'error': 'Invalid booking ID'}, status=404)

class PaymentWebhookView(APIView):
    def post(self, request):
        # Verify webhook signature (implementation varies by payment provider)
        payload = request.data
        transaction_id = payload.get('metadata', {}).get('transaction_id')
        
        try:
            transaction = Transaction.objects.get(id=transaction_id)
            if payload['status'] == 'succeeded':
                transaction.status = 'success'
                transaction.save()
                # Send confirmation email
            else:
                transaction.status = 'failed'
                transaction.save()
                
            return Response(status=200)
        except Transaction.DoesNotExist:
            return Response(status=400)

class TransactionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transactions = Transaction.objects.filter(booking__user=request.user)
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)