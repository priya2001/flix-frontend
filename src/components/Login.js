import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login(credentials)).unwrap();
      navigate('/browse');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-netflix-black">
      <form onSubmit={handleSubmit} className="bg-black/75 p-8 rounded w-96">
        <h2 className="text-white text-2xl mb-6">Sign In</h2>
        <input
          type="email"
          placeholder="Email"
          className="input-field mb-4"
          onChange={(e) => setCredentials({...credentials, email: e.target.value})}
        />
        <input
          type="password"
          placeholder="Password"
          className="input-field mb-6"
          onChange={(e) => setCredentials({...credentials, password: e.target.value})}
        />
        <button type="submit" className="btn-primary w-full">
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Login;
