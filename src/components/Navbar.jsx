import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadUser = async () => {
      try {
        if (!token) {
          setIsAdmin(false);
          return;
        }
        const { data } = await api.get('/auth/me');
        if (!mounted) return;
        setIsAdmin(data?.role === 'admin');
      } catch {
        if (!mounted) return;
        setIsAdmin(false);
      }
    };
    loadUser();
    return () => { mounted = false; };
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAdmin(false);
    navigate('/login');
  };

  return (
    <nav className="bg-black/90 py-3">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="text-netflix-red text-2xl font-bold">MERNFLIX</Link>
        <div className="flex items-center gap-4">
          {token ? (
            <>
              <Link to="/" className="text-white hover:text-gray-300">Home</Link>
              <Link to="/profile" className="text-white hover:text-gray-300">Profile</Link>
              {isAdmin && (
                <>
                  <Link to="/admin" className="text-white hover:text-gray-300">Upload</Link>
                  <Link to="/admin/manage-content" className="text-white hover:text-gray-300">Manage</Link>
                  <Link to="/admin/analytics" className="text-white hover:text-gray-300">Analytics</Link>
                </>
              )}
              <button onClick={handleLogout} className="text-white hover:text-gray-300">
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="text-white hover:text-gray-300">Sign In</Link>
              <Link to="/signup" className="bg-netflix-red text-white px-3 py-1 rounded">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
