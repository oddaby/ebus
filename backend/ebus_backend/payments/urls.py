from django.urls import path
from .views import (
    InitiatePaymentView,
    PaymentWebhookView,
    TransactionHistoryView
)

urlpatterns = [
    path('initiate/', InitiatePaymentView.as_view(), name='initiate-payment'),
    path('webhook/', PaymentWebhookView.as_view(), name='payment-webhook'),
    path('history/', TransactionHistoryView.as_view(), name='transaction-history'),
]