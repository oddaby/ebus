// Payment.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

const Payment = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingDetails, setBookingDetails] = useState(null);
  const { user } = useSelector(state => state.auth);
  const bookingId = location.state?.bookingId;

  useEffect(() => {
    if (!bookingId) {
      navigate('/bookings');
    } else {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await axios.get(`/api/bookings/${bookingId}/`);
      setBookingDetails(response.data);
    } catch (err) {
      setError('Failed to load booking details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!stripe || !elements) {
      return;
    }

    try {
      // Step 1: Initiate payment with backend
      const initiationResponse = await axios.post('/api/payments/initiate/', {
        booking_id: bookingId,
        payment_method: 'card'
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      // Step 2: Confirm payment with Stripe
      const { error: stripeError } = await stripe.confirmCardPayment(
        initiationResponse.data.client_secret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: user.name,
            },
          }
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Step 3: Redirect to confirmation
      navigate('/confirmation', {
        state: { transactionId: initiationResponse.data.transaction_id }
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!bookingDetails) return <div>Loading booking details...</div>;

  return (
    <div className="payment-container">
      <h2>Payment for Booking #{bookingId}</h2>
      <div className="payment-summary">
        <h3>Total Amount: ${bookingDetails.total_fare}</h3>
        <p>Route: {bookingDetails.route?.name}</p>
        <p>Seats: {bookingDetails.seats.join(', ')}</p>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        <CardElement className="card-element" />
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          type="submit" 
          disabled={loading}
          className={`payment-button ${loading ? 'loading' : ''}`}
        >
          {loading ? 'Processing...' : `Pay $${bookingDetails.total_fare}`}
        </button>
      </form>
    </div>
  );
};

export default Payment;