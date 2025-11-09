import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  return (
    <nav className="bg-netflix-black p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-netflix-red text-2xl font-bold">NETFLIX</Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/browse" className="text-white hover:text-gray-300">Browse</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-white hover:text-gray-300">Admin</Link>
              )}
              <button 
                onClick={() => dispatch(logout())}
                className="text-white hover:text-gray-300"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
