import React from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';

const SubscriptionPlans = () => {
  const dispatch = useDispatch();

  const handleSubscription = async (plan) => {
    try {
      const { data } = await axios.post('/api/payment/create-subscription', { plan });
      
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            await axios.post('/api/payment/verify', response);
            alert('Subscription successful!');
          } catch (error) {
            console.error('Payment verification failed:', error);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Subscription failed:', error);
    }
  };

  return (
    <div className="subscription-plans">
      <div className="plan-card">
        <h3>Monthly Plan</h3>
        <p>₹499/month</p>
        <button onClick={() => handleSubscription('monthly')}>Subscribe</button>
      </div>
      <div className="plan-card">
        <h3>Yearly Plan</h3>
        <p>₹4999/year</p>
        <button onClick={() => handleSubscription('yearly')}>Subscribe</button>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
