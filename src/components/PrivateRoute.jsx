import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';

export default function PrivateRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem('token');
  const [allowed, setAllowed] = useState(!adminOnly); // if not adminOnly, allowed will be true after token check
  const [checking, setChecking] = useState(adminOnly);

  if (!token) return <Navigate to="/login" replace />;

  useEffect(() => {
    let mounted = true;
    const checkRole = async () => {
      if (!adminOnly) return;
      setChecking(true);
      try {
        const { data } = await api.get('/auth/me');
        if (!mounted) return;
        setAllowed(data?.role === 'admin');
      } catch {
        if (!mounted) return;
        setAllowed(false);
      } finally {
        if (mounted) setChecking(false);
      }
    };
    checkRole();
    return () => { mounted = false; };
  }, [adminOnly]);

  if (adminOnly && checking) {
    return <div className="text-center py-10">Checking permissions...</div>;
  }

  if (adminOnly && !allowed) {
    return <Navigate to="/" replace />;
  }

  return children;
}
