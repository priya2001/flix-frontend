import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from './Loader.jsx';

export default function SeriesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/content/${id}`);
        if (!mounted) return;
        setSeries(data);
      } catch (err) {
        console.error('Failed to load series:', err);
        if (!mounted) return;
        setSeries(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <Loader text="Loading series..." />;
  if (!series) return <div className="text-gray-300">Series not found.</div>;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Series Header */}
      <div className="mb-6">
        <img 
          src={series.thumbnailUrl || 'https://via.placeholder.com/1200x400'} 
          alt={series.title}
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
        <h1 className="text-3xl font-bold mb-2">{series.title}</h1>
        <p className="text-gray-300 mb-4">{series.description}</p>
        <div className="flex gap-4 text-sm text-gray-400">
          {series.releaseYear && <span>Year: {series.releaseYear}</span>}
          {series.genre && series.genre.length > 0 && (
            <span>Genre: {series.genre.join(', ')}</span>
          )}
          {series.access === 'paid' && (
            <span className="bg-red-600 px-2 py-0.5 rounded text-white">Premium</span>
          )}
        </div>
      </div>

      {/* Episodes List */}
      <div>
        <h2 className="text-2xl mb-4">Episodes ({series.episodes?.length || 0})</h2>
        {!series.episodes || series.episodes.length === 0 ? (
          <div className="text-gray-300">No episodes available.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {series.episodes.map((episode, index) => (
              <div 
                key={index}
                onClick={() => navigate(`/watch/${id}/episode/${index}`)}
                className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-netflix-red transition"
              >
                <img 
                  src={episode.thumbnailUrl || series.thumbnailUrl || 'https://via.placeholder.com/320x180'}
                  alt={episode.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-3">
                  <h3 className="font-semibold mb-1">
                    Episode {index + 1}: {episode.title || 'Untitled'}
                  </h3>
                  {episode.duration && (
                    <p className="text-xs text-gray-400">{Math.floor(episode.duration / 60)} min</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
