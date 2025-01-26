from rest_framework import serializers
from .models import Transaction

class PaymentInitiationSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=Transaction.PAYMENT_METHODS)

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'