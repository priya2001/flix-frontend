import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from './Loader.jsx';

export default function VideoPlayer() {
  const { id, episodeIndex } = useParams();
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState('');
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);

  const currentEpisodeIndex = episodeIndex !== undefined ? parseInt(episodeIndex) : null;
  const isSeries = content?.type === 'series';
  const totalEpisodes = content?.episodes?.length || 0;
  const hasNextEpisode = isSeries && currentEpisodeIndex !== null && currentEpisodeIndex < totalEpisodes - 1;
  const hasPrevEpisode = isSeries && currentEpisodeIndex !== null && currentEpisodeIndex > 0;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/content/${id}`);
        if (!mounted) return;
        setContent(data);

        // If it's a series, redirect to series detail page
        if (data.type === 'series' && episodeIndex === undefined) {
          navigate(`/series/${id}`);
          return;
        }

        // Determine video URL
        let url = '';
        if (data.type === 'series' && episodeIndex !== undefined) {
          const episode = data.episodes?.[parseInt(episodeIndex)];
          url = episode?.videoUrl || '';
        } else if (data.type === 'movie') {
          url = `/api/content/${id}/stream`;
        }

        setVideoUrl(url);
      } catch (err) {
        console.error('Failed to load content:', err);
        if (!mounted) return;
        setVideoUrl('');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id, episodeIndex, navigate]);

  // Auto-play next episode when current ends
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasNextEpisode) return;

    const handleEnded = () => {
      // Auto-play next episode
      const nextIndex = currentEpisodeIndex + 1;
      navigate(`/watch/${id}/episode/${nextIndex}`);
    };

    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [hasNextEpisode, currentEpisodeIndex, id, navigate]);

  const goToNextEpisode = () => {
    if (hasNextEpisode) {
      navigate(`/watch/${id}/episode/${currentEpisodeIndex + 1}`);
    }
  };

  const goToPrevEpisode = () => {
    if (hasPrevEpisode) {
      navigate(`/watch/${id}/episode/${currentEpisodeIndex - 1}`);
    }
  };

  if (loading) return <Loader text="Loading video..." />;

  return (
    <div className="relative">
      {videoUrl ? (
        <div>
          <video 
            ref={videoRef}
            controls 
            className="w-full max-h-[70vh] bg-black"
            autoPlay
          >
            <source src={videoUrl} type="video/mp4" />
          </video>

          {/* Episode Navigation for Series */}
          {isSeries && currentEpisodeIndex !== null && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={goToPrevEpisode}
                disabled={!hasPrevEpisode}
                className={`px-4 py-2 rounded ${
                  hasPrevEpisode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                ← Previous Episode
              </button>
              <button
                onClick={goToNextEpisode}
                disabled={!hasNextEpisode}
                className={`px-4 py-2 rounded ${
                  hasNextEpisode 
                    ? 'bg-netflix-red hover:bg-red-700' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next Episode →
              </button>
            </div>
          )}

          {content && (
            <div className="mt-4">
              <h2 className="text-2xl font-bold">{content.title}</h2>
              {currentEpisodeIndex !== null && content.episodes?.[currentEpisodeIndex] && (
                <p className="text-gray-400">
                  Episode {currentEpisodeIndex + 1}: {content.episodes[currentEpisodeIndex].title}
                </p>
              )}
              <p className="text-gray-300 mt-2">{content.description}</p>
              {content.type === 'series' && (
                <button 
                  onClick={() => navigate(`/series/${id}`)}
                  className="mt-4 btn-primary"
                >
                  ← Back to All Episodes
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-80 bg-black flex items-center justify-center text-gray-400">
          No video available.
        </div>
      )}
    </div>
  );
}
