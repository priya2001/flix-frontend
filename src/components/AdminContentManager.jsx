import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Loader from './Loader.jsx';
import ContentCard from './ContentCard.jsx';

export default function AdminContentManager() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState({
    types: [],
    access: [],
    ageGroups: [],
    genders: [],
    genres: [],
    dateFrom: '',
    dateTo: '',
    sizeMin: '',
    sizeMax: ''
  });

  const [searchTerm, setSearchTerm] = useState(''); // added search

  const fetchContent = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.types.length) params.type = filters.types.join(',');
      if (filters.access.length) params.access = filters.access.join(',');
      if (filters.ageGroups.length) params.targetAgeGroup = filters.ageGroups.join(',');
      if (filters.genders.length) params.targetGender = filters.genders.join(',');
      if (filters.genres.length) params.genre = filters.genres.join(',');
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (filters.sizeMin) params.sizeMin = filters.sizeMin;
      if (filters.sizeMax) params.sizeMax = filters.sizeMax;

      const { data } = await api.get('/content', { params });
      setContent(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch content:', error);
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const toggleFilter = (category, value) => {
    setFilters(prev => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const handleUpdate = async (id, updates) => {
    try {
      await api.put(`/content/${id}`, updates);
      setContent(prev => prev.map(c => c._id === id ? { ...c, ...updates } : c));
    } catch (e) {
      throw e;
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this content?')) return;
    try {
      await api.delete(`/content/${id}`);
      setContent(prev => prev.filter(c => c._id !== id));
    } catch (e) {
      alert('Delete failed');
    }
  };

  const applyFilters = () => {
    fetchContent();
  };

  const clearFilters = () => {
    setFilters({
      types: [],
      access: [],
      ageGroups: [],
      genders: [],
      genres: [],
      dateFrom: '',
      dateTo: '',
      sizeMin: '',
      sizeMax: ''
    });
  };

  // Filter content by search term (client-side)
  const filteredContent = searchTerm.trim()
    ? content.filter(item => 
        (item.title || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : content;

  if (loading) return <Loader text="Loading content..." />;

  return (
    <div>
      <h2 className="text-2xl mb-4">Manage Content</h2>

      {/* Search Bar with Icon */}
      <div className="mb-4 relative">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by movie or series name..."
            className="input-field text-white bg-gray-700 w-full pl-10"
          />
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="bg-gray-800 p-4 rounded mb-6">
        <h3 className="text-lg mb-3">Filters</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm mb-2">Type</label>
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.types.includes('movie')}
                  onChange={() => toggleFilter('types', 'movie')}
                />
                Movie
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.types.includes('series')}
                  onChange={() => toggleFilter('types', 'series')}
                />
                Series
              </label>
            </div>
          </div>

          {/* Access Filter */}
          <div>
            <label className="block text-sm mb-2">Access</label>
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.access.includes('free')}
                  onChange={() => toggleFilter('access', 'free')}
                />
                Free
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.access.includes('paid')}
                  onChange={() => toggleFilter('access', 'paid')}
                />
                Premium
              </label>
            </div>
          </div>

          {/* Age Group Filter */}
          <div>
            <label className="block text-sm mb-2">Age Group</label>
            <div className="space-y-1">
              {['all', 'kids', 'teens', 'adults'].map(age => (
                <label key={age} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.ageGroups.includes(age)}
                    onChange={() => toggleFilter('ageGroups', age)}
                  />
                  {age === 'all' ? 'All Ages' : age.charAt(0).toUpperCase() + age.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-sm mb-2">Gender Target</label>
            <div className="space-y-1">
              {['all', 'male', 'female'].map(gender => (
                <label key={gender} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.genders.includes(gender)}
                    onChange={() => toggleFilter('genders', gender)}
                  />
                  {gender === 'all' ? 'All Genders' : gender.charAt(0).toUpperCase() + gender.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm mb-2">Upload Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="input-field text-white bg-gray-700 mb-2 text-sm"
              placeholder="From"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="input-field text-white bg-gray-700 text-sm"
              placeholder="To"
            />
          </div>

          {/* Size Range (MB) */}
          <div>
            <label className="block text-sm mb-2">File Size (MB)</label>
            <input
              type="number"
              value={filters.sizeMin}
              onChange={(e) => setFilters({...filters, sizeMin: e.target.value})}
              className="input-field text-white bg-gray-700 mb-2 text-sm"
              placeholder="Min MB"
              min="0"
            />
            <input
              type="number"
              value={filters.sizeMax}
              onChange={(e) => setFilters({...filters, sizeMax: e.target.value})}
              className="input-field text-white bg-gray-700 text-sm"
              placeholder="Max MB"
              min="0"
            />
          </div>
        </div>

        {/* Genre Filter */}
        <div className="mt-4">
          <label className="block text-sm mb-2">Genres</label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Adventure', 'Animation', 'Documentary', 'Fantasy', 'Mystery'].map(genre => (
              <label key={genre} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.genres.includes(genre)}
                  onChange={() => toggleFilter('genres', genre)}
                />
                {genre}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={applyFilters} className="btn-primary">
            Apply Filters
          </button>
          <button onClick={clearFilters} className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500">
            Clear
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <p className="text-gray-400 mb-3">Total: {filteredContent.length} items</p>
      {filteredContent.length === 0 ? (
        <div className="text-gray-300">No content matches the filters or search.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredContent.map(item => (
            <ContentCard
              key={item._id}
              item={item}
              isSubscriber={true}
              isAdmin={true}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
