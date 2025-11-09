import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from './Loader.jsx';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (!mounted) return;
        setUser(data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    try {
      await api.post('/payment/cancel');
      alert('Subscription cancelled successfully');
      window.location.reload();
    } catch (err) {
      alert('Failed to cancel subscription');
    }
  };

  if (loading) return <Loader text="Loading profile..." />;

  if (!user) return <div className="text-gray-300">Not signed in.</div>;

  const hasActiveSubscription = user.subscription?.status === 'active';
  const currentPlan = user.subscription?.plan || 'none';

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl mb-4">Profile</h2>
      <div className="bg-gray-800 p-4 rounded mb-4">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role || 'user'}</p>
        <p><strong>Gender:</strong> <span className="capitalize">{user.gender || 'N/A'}</span></p>
        <p><strong>Age:</strong> {user.age || 'N/A'}</p>
        <div className="mt-3">
          <p className="font-semibold mb-1">Favorite Genres:</p>
          <div className="flex flex-wrap gap-2">
            {user.preferences?.genres?.length > 0 ? (
              user.preferences.genres.map(genre => (
                <span key={genre} className="bg-netflix-red px-2 py-1 rounded text-xs">
                  {genre}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-sm">No genres selected</span>
            )}
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-lg">Subscription</h3>
          <p>Plan: <span className="capitalize">{currentPlan}</span></p>
          <p>Status: <span className="capitalize">{user.subscription?.status || 'inactive'}</span></p>
          {user.subscription?.endDate && (
            <p>Valid until: {new Date(user.subscription.endDate).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      {/* Subscription Actions */}
      <div className="bg-gray-800 p-4 rounded">
        <h4 className="text-lg mb-3">Manage Subscription</h4>
        <div className="flex gap-3">
          {!hasActiveSubscription ? (
            <button 
              onClick={() => navigate('/subscribe')} 
              className="btn-primary"
            >
              Subscribe Now
            </button>
          ) : (
            <>
              <button 
                onClick={() => navigate('/subscribe')} 
                className="btn-primary"
              >
                Upgrade Plan
              </button>
              <button 
                onClick={handleCancelSubscription}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Cancel Subscription
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
