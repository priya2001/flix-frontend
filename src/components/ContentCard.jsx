import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ContentCard({ item, isSubscriber, isAdmin, onUpdate, onDelete }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ 
    title: item.title || '', 
    description: item.description || '',
    genre: item.genre || [],
    targetAgeGroup: item.targetAgeGroup || 'all',
    targetGender: item.targetGender || 'all'
  });
  const [saving, setSaving] = useState(false);
  const menuRef = useRef(null);

  const id = item?._id || item?.id || item?.key || Math.random().toString(36).slice(2, 9);
  const isPaid = item.access === 'paid';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [menuOpen]);

  const handleCardClick = (e) => {
    if (e.target.closest('.menu-container') || e.target.closest('.edit-modal')) return;
    if (isPaid && !isSubscriber) {
      navigate('/subscribe');
      return;
    }
    // Navigate to series detail if series, otherwise video player
    if (item.type === 'series') {
      navigate(`/series/${id}`);
    } else {
      navigate(`/watch/${id}`);
    }
  };

  const handleSave = () => {
    alert('Save feature - coming soon!');
  };

  const handleShare = () => {
    const url = `${window.location.origin}/watch/${id}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const handleAbout = () => {
    alert(`Title: ${item.title || 'Untitled'}\nDescription: ${item.description || 'No description'}\nType: ${item.type || 'N/A'}\nAccess: ${isPaid ? 'Premium' : 'Free'}`);
  };

  const handleEdit = async () => {
    if (!isAdmin) return;
    setSaving(true);
    try {
      await onUpdate(id, editData);
      setEditing(false);
      setMenuOpen(false);
    } catch (e) {
      alert('Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="cursor-pointer bg-gray-800 rounded overflow-hidden relative group"
      >
        {/* Access badge */}
        <div className="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-black/70 z-10">
          {isPaid ? 'Premium' : 'Free'}
        </div>

        {/* 3-dot menu */}
        <div ref={menuRef} className="menu-container absolute top-2 right-2 z-20">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="bg-black/70 hover:bg-black text-white p-1.5 rounded"
            aria-label="Menu"
          >
            {/* 3-dot icon */}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="10" cy="4" r="1.5"/>
              <circle cx="10" cy="10" r="1.5"/>
              <circle cx="10" cy="16" r="1.5"/>
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-gray-900 border border-gray-700 rounded shadow-lg">
              {/* User options */}
              <button onClick={(e) => { e.stopPropagation(); handleSave(); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 hover:bg-gray-700 text-sm">
                💾 Save
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleShare(); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 hover:bg-gray-700 text-sm">
                🔗 Share
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleAbout(); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 hover:bg-gray-700 text-sm">
                ℹ️ About
              </button>

              {/* Admin options */}
              {isAdmin && (
                <>
                  <hr className="border-gray-700" />
                  <button onClick={(e) => { e.stopPropagation(); onUpdate(id, { access: isPaid ? 'free' : 'paid' }); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 hover:bg-gray-700 text-sm">
                    {isPaid ? '🆓 Make Free' : '💎 Make Premium'}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setEditing(true); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 hover:bg-gray-700 text-sm">
                    ✏️ Edit
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(id); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 hover:bg-red-600 text-sm text-red-400">
                    🗑️ Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Thumbnail */}
        <img
          src={item.thumbnailUrl || item.thumbnail || 'https://via.placeholder.com/320x180'}
          alt={item.title || item.name || 'Untitled'}
          className="w-full h-40 object-cover group-hover:opacity-80 transition"
        />

        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold flex items-center gap-2">
            {item.title || item.name || 'Untitled'}
            {isPaid && <span className="text-xs bg-red-600 px-2 py-0.5 rounded">Premium</span>}
          </h3>
          <p className="text-sm text-gray-300 line-clamp-2">{item.description || item.overview || ''}</p>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="edit-modal fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setEditing(false)}>
          <div className="bg-gray-800 p-6 rounded max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl mb-4">Edit Content</h3>
            
            {/* Title */}
            <input
              type="text"
              placeholder="Title"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="input-field text-white bg-gray-700 mb-3 w-full"
            />
            
            {/* Description */}
            <textarea
              placeholder="Description"
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              className="input-field text-white bg-gray-700 mb-4 h-24 w-full"
            />

            {/* Recommendation Settings */}
            <div className="bg-gray-900 p-4 rounded mb-4">
              <h4 className="text-lg mb-3 text-blue-400">Recommendation Settings</h4>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Age Group */}
                <div>
                  <label className="block text-sm mb-2 text-gray-300">Target Age Group</label>
                  <select
                    value={editData.targetAgeGroup}
                    onChange={(e) => setEditData({ ...editData, targetAgeGroup: e.target.value })}
                    className="input-field text-white bg-gray-700 w-full"
                  >
                    <option value="all">All Ages</option>
                    <option value="kids">Kids (Under 13)</option>
                    <option value="teens">Teens (13-17)</option>
                    <option value="adults">Adults (18+)</option>
                  </select>
                </div>

                {/* Gender Group */}
                <div>
                  <label className="block text-sm mb-2 text-gray-300">Target Gender</label>
                  <select
                    value={editData.targetGender}
                    onChange={(e) => setEditData({ ...editData, targetGender: e.target.value })}
                    className="input-field text-white bg-gray-700 w-full"
                  >
                    <option value="all">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              {/* Genre List */}
              <div className="mt-4">
                <label className="block text-sm mb-2 text-gray-300">Genres (Select multiple)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Adventure', 'Animation', 'Documentary', 'Fantasy', 'Mystery'].map(genre => (
                    <label key={genre} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editData.genre.includes(genre)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditData({ ...editData, genre: [...editData.genre, genre] });
                          } else {
                            setEditData({ ...editData, genre: editData.genre.filter(g => g !== genre) });
                          }
                        }}
                        className="text-blue-500"
                      />
                      {genre}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={handleEdit} className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditing(false)} className="bg-gray-600 px-4 py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
