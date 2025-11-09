import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from './Loader.jsx';

export default function SubscriptionPlans() {
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const isDev = import.meta.env.MODE !== 'production';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setCurrentPlan(data?.subscription?.plan || null);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    fetchUser();

    const checkRazorpay = () => {
      if (window.Razorpay) setRazorpayLoaded(true);
      else setTimeout(checkRazorpay, 100);
    };
    checkRazorpay();
  }, []);

  const mockActivate = async (plan) => {
    try {
      const { data } = await api.post('/payment/mock-activate', { plan });
      alert('Payment will be processed and your subscription has been activated.');
      window.location.href = '/profile';
      return data;
    } catch (e) {
      console.error('Mock activate failed:', e);
      alert('Failed to activate subscription in test mode.');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const handleSubscription = async (plan) => {
    setLoading(true);
    try {
      // If in dev/test or Razorpay not loaded, skip to mock
      if (isDev && !window.Razorpay) {
        return await mockActivate(plan);
      }

      const { data } = await api.post('/payment/create-subscription', { plan });
      if (!data?.order?.id) {
        if (isDev) return await mockActivate(plan);
        throw new Error('Invalid order response from server');
      }

      const options = {
        key: 'rzp_test_Rd17YcrbOYSSgH',
        order_id: data.order.id,
        amount: data.amount,
        currency: 'INR',
        name: 'MERNFLIX',
        description: `${plan} subscription`,
        handler: async (response) => {
          try {
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan
            });
            alert('Payment successful and subscription activated!');
            window.location.href = '/profile';
          } catch (err) {
            console.error('Payment verification failed:', err);
            if (isDev) return await mockActivate(plan);
            alert('Payment verification failed. Please contact support.');
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
        theme: { color: '#E50914' }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', async () => {
        if (isDev) return await mockActivate(plan);
        alert('Payment failed. Please try again.');
        setLoading(false);
      });
      razorpay.open();
    } catch (err) {
      console.error('Subscription error:', err);
      if (isDev) {
        try {
          return await mockActivate(plan);
        } catch (_) {}
      }
      alert('Failed to create subscription order. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      {loading && <Loader text="Processing..." />}
      <h2 className="text-3xl mb-2 text-center">Choose Your Plan</h2>
      {currentPlan && (
        <p className="text-center text-gray-400 mb-6">
          Current Plan: <span className="capitalize text-white">{currentPlan}</span>
        </p>
      )}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-2xl mb-2">Monthly Plan</h3>
          <p className="text-4xl mb-4">₹1<span className="text-sm">/month</span></p>
          <ul className="mb-6 space-y-2">
            <li>✓ Unlimited streaming</li>
            <li>✓ HD quality</li>
            <li>✓ Cancel anytime</li>
          </ul>
          <button 
            onClick={() => handleSubscription('monthly')} 
            className="btn-primary w-full"
            disabled={loading || currentPlan === 'monthly' || !razorpayLoaded}
          >
            {currentPlan === 'monthly' ? 'Current Plan' : 'Subscribe Monthly'}
          </button>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg border-2 border-netflix-red">
          <h3 className="text-2xl mb-2">Yearly Plan</h3>
          <p className="text-4xl mb-4">₹10<span className="text-sm">/year</span></p>
          <p className="text-green-400 mb-4">Save ₹2!</p>
          <ul className="mb-6 space-y-2">
            <li>✓ Unlimited streaming</li>
            <li>✓ HD quality</li>
            <li>✓ Cancel anytime</li>
            <li>✓ Best value</li>
          </ul>
          <button 
            onClick={() => handleSubscription('yearly')} 
            className="btn-primary w-full"
            disabled={loading || currentPlan === 'yearly' || !razorpayLoaded}
          >
            {currentPlan === 'yearly' ? 'Current Plan' : 'Subscribe Yearly'}
          </button>
        </div>
      </div>
    </div>
  );
}
