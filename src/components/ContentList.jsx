import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from './Loader.jsx';
import ContentCard from './ContentCard.jsx';

export default function ContentList() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // search + sort for optional filtering of movies / series titles
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');

  // recommendations
  const [recommendations, setRecommendations] = useState([]);
  const [viewedIds, setViewedIds] = useState(new Set());

  // showMore states (each section independent)
  const [showMoreRecommended, setShowMoreRecommended] = useState(false);
  const [showMoreMovies, setShowMoreMovies] = useState(false);
  const [showMoreSeries, setShowMoreSeries] = useState(false);

  const navigate = useNavigate();

  const normalizeResponse = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.content)) return data.content;
    if (Array.isArray(data.items)) return data.items;
    if (typeof data === 'object') {
      const vals = Object.values(data).filter(v => v && (Array.isArray(v) || typeof v === 'object'));
      for (const v of vals) if (Array.isArray(v)) return v;
      return Object.values(data);
    }
    return [];
  };

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [contentRes, recRes, userRes] = await Promise.all([
          api.get('/content'),
          api.get('/recommendations').catch(() => ({ data: [] })),
          api.get('/auth/me').catch(() => ({ data: null }))
        ]);

        if (!mounted) return;

        const allContent = normalizeResponse(contentRes.data);
        setContent(allContent);

        const recData = normalizeResponse(recRes.data);
        const user = userRes.data;

        const viewed = new Set(
          (user?.watchHistory || [])
            .map(h => h.content?.toString() || h.content?._id?.toString())
            .filter(Boolean)
        );
        setViewedIds(viewed);

        const filteredRecs = recData.filter(r =>
          !viewed.has(r._id?.toString() || r.id?.toString())
        );
        setRecommendations(filteredRecs);

        setIsSubscriber(user?.subscription?.status === 'active');
        setIsAdmin(user?.role === 'admin');
      } catch (error) {
        if (!mounted) return;
        console.error('Failed to load content:', error);
        setContent([
          { _id: '1', title: 'Demo Movie', description: 'Demo description', type: 'movie', thumbnailUrl: 'https://via.placeholder.com/320x180' },
          { _id: '2', title: 'Demo Series', description: 'Demo description', type: 'series', thumbnailUrl: 'https://via.placeholder.com/320x180' }
        ]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  const handleUpdate = async (id, updates) => {
    if (!isAdmin) return;
    try {
      await api.put(`/content/${id}`, updates);
      setContent(prev => prev.map(c => c._id === id ? { ...c, ...updates } : c));
      setRecommendations(prev => prev.map(c => c._id === id ? { ...c, ...updates } : c));
    } catch (e) {
      throw e;
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!confirm('Delete this content?')) return;
    try {
      await api.delete(`/content/${id}`);
      setContent(prev => prev.filter(c => c._id !== id));
      setRecommendations(prev => prev.filter(c => c._id !== id));
    } catch (e) {
      alert('Delete failed');
    }
  };

  if (loading) return <Loader text="Loading..." />;

  // Filter + sort helpers
  const term = search.trim().toLowerCase();
  const applySearch = (arr) =>
    term
      ? arr.filter(item =>
          (item.title || item.name || '').toLowerCase().includes(term)
        )
      : arr;

  const applySort = (arr) => {
    if (sort === 'titleAsc') return [...arr].sort((a,b)=> (a.title||'').localeCompare(b.title||''));
    if (sort === 'titleDesc') return [...arr].sort((a,b)=> (b.title||'').localeCompare(a.title||''));
    return arr;
  };

  // Split content into movies & series
  const movies = applySort(applySearch(content.filter(c => c.type === 'movie')));
  const series = applySort(applySearch(content.filter(c => c.type === 'series')));

  // Recommended - show for all users (removed admin check)
  const recommendedVisible = recommendations.length > 0;
  const recommendedFiltered = applySort(applySearch(recommendations));

  // Layout logic
  const ITEMS_PER_ROW = 6;
  const ROW_MULTIPLIER = showMore => (showMore ? 4 : 1); // show first row or 4 rows
  const sliceForSection = (arr, showMore) =>
    arr.slice(0, ROW_MULTIPLIER(showMore) * ITEMS_PER_ROW);

  const recommendedToDisplay = sliceForSection(recommendedFiltered, showMoreRecommended);
  const moviesToDisplay      = sliceForSection(movies, showMoreMovies);
  const seriesToDisplay      = sliceForSection(series, showMoreSeries);

  // Render helper for a section
  const renderSection = (title, items, showMore, setShowMore) => {
    if (!items.length) return null;
    const isExpanded = showMore;
    const canExpand = items.length > ITEMS_PER_ROW;
    return (
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl">{title}</h2>
          {canExpand && !isExpanded && (
            <button
              onClick={() => setShowMore(true)}
              className="text-netflix-red hover:underline text-sm"
            >
              More →
            </button>
          )}
          {isExpanded && (
            <button
              onClick={() => setShowMore(false)}
              className="text-gray-400 hover:underline text-sm"
            >
              Show Less
            </button>
          )}
        </div>

        {/* If expanded, show grid with multiple rows; otherwise horizontal scroll row */}
        {isExpanded ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {items.map(item => (
              <ContentCard
                key={item._id || item.id}
                item={item}
                isSubscriber={isSubscriber}
                isAdmin={isAdmin}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {items.slice(0, ITEMS_PER_ROW).map(item => (
              <div key={item._id || item.id} className="flex-shrink-0 w-60">
                <ContentCard
                  item={item}
                  isSubscriber={isSubscriber}
                  isAdmin={isAdmin}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Search + Sort */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search titles..."
          className="input-field text-white bg-gray-700 w-full md:flex-1"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="input-field text-white bg-gray-700 md:w-48"
        >
          <option value="default">Sort: Default</option>
          <option value="titleAsc">Title: A → Z</option>
          <option value="titleDesc">Title: Z → A</option>
        </select>
      </div>

      {/* Sections */}
      {recommendedVisible &&
        renderSection(
          'Recommended For You',
          recommendedToDisplay,
          showMoreRecommended,
          setShowMoreRecommended
        )}

      {renderSection(
        'Movies',
        moviesToDisplay,
        showMoreMovies,
        setShowMoreMovies
      )}

      {renderSection(
        'Series',
        seriesToDisplay,
        showMoreSeries,
        setShowMoreSeries
      )}

      {/* Empty state when nothing matches */}
      {!recommendedVisible && movies.length === 0 && series.length === 0 && (
        <div className="text-gray-300">No content available.</div>
      )}
    </div>
  );
}
