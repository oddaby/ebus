// BookingConfirmation.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';


const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const transactionId = location.state?.transactionId;
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    if (!transactionId) {
      navigate('/');
    } else {
      fetchTransactionDetails();
    }
  }, [transactionId]);

  const fetchTransactionDetails = async () => {
    try {
      const response = await axios.get(`/api/payments/${transactionId}/`);
      setTransaction(response.data);
    } catch (err) {
      console.error('Error fetching transaction:', err);
    }
  };

  if (!transaction) return <div>Loading confirmation...</div>;

  return (
    <div className="confirmation-container">
      <h2>Payment Successful! 🎉</h2>
      <div className="confirmation-details">
        <p>Transaction ID: {transaction.id}</p>
        <p>Amount: ${transaction.amount}</p>
        <p>Status: {transaction.status}</p>
        <p>Payment Method: {transaction.payment_method}</p>
      </div>
      <button 
        className="home-button"
        onClick={() => navigate('/')}
      >
        Return to Home
      </button>
    </div>
  );
};

export default BookingConfirmation;