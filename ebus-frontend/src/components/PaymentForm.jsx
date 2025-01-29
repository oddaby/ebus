import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader } from 'react-feather';

const PaymentForm = ({ amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!stripe || !elements) {
      return;
    }

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (stripeError) {
        throw stripeError;
      }

      // Process payment with your backend
      const response = await processPayment(paymentMethod.id, amount);
      
      if (response.success) {
        onSuccess(response.transactionId);
      } else {
        throw new Error(response.error || 'Payment failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-semibold mb-6">Payment Details</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <div className="border rounded-lg p-3 hover:border-primary transition-colors">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1a202c',
                    '::placeholder': {
                      color: '#a0aec0',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="animate-spin w-5 h-5" />
              Processing...
            </>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;