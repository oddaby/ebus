# Generated by Django 5.0.6 on 2025-01-28 14:50

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('bookings', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('transaction_id', models.CharField(max_length=100, unique=True)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=8)),
                ('payment_method', models.CharField(choices=[('mpesa', 'M-Pesa'), ('card', 'Credit/Debit Card'), ('paypal', 'PayPal')], max_length=20)),
                ('status', models.CharField(choices=[('success', 'Success'), ('pending', 'Pending'), ('failed', 'Failed')], default='pending', max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('booking', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='transaction', to='bookings.booking')),
            ],
        ),
    ]
