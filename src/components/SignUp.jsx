import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function SignUp() {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'male',
    age: '',
    genres: []
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const availableGenres = ['Horror', 'Comedy', 'Action', 'Drama', 'Romance', 'Thriller', 'Sci-Fi', 'Documentary', 'Animation', 'Fantasy'];

  const toggleGenre = (genre) => {
    setUserData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (userData.password !== userData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Attempting registration...');
      const { data } = await api.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        gender: userData.gender,
        age: userData.age,
        genres: userData.genres
      });
      
      console.log('Registration successful:', data);
      
      if (!data.token) {
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('token', data.token);
      alert('Registration successful! Welcome to MERNFLIX.');
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Registration failed';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-netflix-black">
      <div className="bg-black/75 p-8 rounded w-full max-w-md">
        <h2 className="text-white text-3xl mb-6 text-center">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={userData.name}
            className="input-field text-white bg-gray-700"
            onChange={e => setUserData({...userData, name: e.target.value})}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={userData.email}
            className="input-field text-white bg-gray-700"
            onChange={e => setUserData({...userData, email: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={userData.password}
            className="input-field text-white bg-gray-700"
            onChange={e => setUserData({...userData, password: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={userData.confirmPassword}
            className="input-field text-white bg-gray-700"
            onChange={e => setUserData({...userData, confirmPassword: e.target.value})}
            required
          />
          <select
            value={userData.gender}
            onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
            className="input-field text-white bg-gray-700"
            required
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <input
            type="number"
            min="0"
            max="120"
            placeholder="Age"
            value={userData.age}
            onChange={(e) => setUserData({ ...userData, age: e.target.value ? parseInt(e.target.value, 10) : '' })}
            className="input-field text-white bg-gray-700"
            required
          />

          {/* Genre Tags Selection */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-300">Select Your Favorite Genres (at least 1)</label>
            <div className="grid grid-cols-2 gap-2">
              {availableGenres.map(genre => (
                <label
                  key={genre}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition ${
                    userData.genres.includes(genre)
                      ? 'bg-netflix-red text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={userData.genres.includes(genre)}
                    onChange={() => toggleGenre(genre)}
                    className="hidden"
                  />
                  <span className="text-sm">{genre}</span>
                </label>
              ))}
            </div>
            {userData.genres.length === 0 && (
              <p className="text-xs text-gray-400">Please select at least one genre</p>
            )}
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full"
            disabled={loading || userData.genres.length === 0}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-netflix-red hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
