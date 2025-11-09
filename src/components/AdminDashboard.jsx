import React, { useState } from 'react';
import api from '../services/api';
import Loader from './Loader.jsx';

export default function AdminDashboard() {
  const [file, setFile] = useState(null);
  const [episodeFiles, setEpisodeFiles] = useState([]); // series files
  const [episodeTitles, setEpisodeTitles] = useState(''); // one per line
  const [contentData, setContentData] = useState({
    title: '',
    description: '',
    type: 'movie',
    genre: [], // changed to array
    releaseYear: '',
    access: 'free',
    targetAgeGroup: 'all',
    targetGender: 'all'
  });
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (contentData.type === 'series' && episodeFiles.length === 0) {
      alert('Please select episode files');
      return;
    }
    if (contentData.type !== 'series' && !file) {
      alert('Please select a video file');
      return;
    }

    setUploading(true);
    const formData = new FormData();

    try {
      if (contentData.type === 'series') {
        // Append multiple episode files
        episodeFiles.forEach(f => formData.append('videos', f));
        const titles = episodeTitles
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean);
        formData.append('data', JSON.stringify({ ...contentData, episodeTitles: titles }));
      } else {
        // Single movie file
        formData.append('video', file);
        formData.append('data', JSON.stringify(contentData));
      }

      await api.post('/content/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Content uploaded successfully');

      // reset form
      setFile(null);
      setEpisodeFiles([]);
      setEpisodeTitles('');
      setContentData({ title: '', description: '', type: 'movie', genre: [], releaseYear: '', access: 'free', targetAgeGroup: 'all', targetGender: 'all' });
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const availableGenres = ['Horror', 'Comedy', 'Action', 'Drama', 'Romance', 'Thriller', 'Sci-Fi', 'Documentary', 'Animation', 'Fantasy'];

  const toggleGenre = (genre) => {
    setContentData(prev => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter(g => g !== genre)
        : [...prev.genre, genre]
    }));
  };

  return (
    <div className="max-w-xl mx-auto relative">
      {uploading && <Loader text="Uploading content..." />}
      <h2 className="text-2xl mb-4">Upload New Content</h2>

      <form onSubmit={handleUpload} className="space-y-3">
        <input
          type="text"
          placeholder="Title"
          className="input-field text-white bg-gray-700"
          value={contentData.title}
          onChange={(e) => setContentData({ ...contentData, title: e.target.value })}
          disabled={uploading}
        />
        <textarea
          placeholder="Description"
          className="input-field text-white bg-gray-700"
          value={contentData.description}
          onChange={(e) => setContentData({ ...contentData, description: e.target.value })}
          disabled={uploading}
        />
        
        <div className="grid grid-cols-2 gap-2">
          <select
            className="input-field"
            value={contentData.type}
            onChange={(e) => setContentData({ ...contentData, type: e.target.value })}
            disabled={uploading}
          >
            <option value="movie">Movie</option>
            <option value="series">Series</option>
          </select>
          <select
            className="input-field"
            value={contentData.access}
            onChange={(e) => setContentData({ ...contentData, access: e.target.value })}
            disabled={uploading}
          >
            <option value="free">Free</option>
            <option value="paid">Paid (Premium)</option>
          </select>
        </div>

        {/* Genre Tags Multi-Select */}
        <div className="space-y-2">
          <label className="block text-sm text-gray-300">Select Genres (multiple)</label>
          <div className="grid grid-cols-3 gap-2">
            {availableGenres.map(genre => (
              <label
                key={genre}
                className={`flex items-center justify-center gap-2 p-2 rounded cursor-pointer transition text-xs ${
                  contentData.genre.includes(genre)
                    ? 'bg-netflix-red text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={contentData.genre.includes(genre)}
                  onChange={() => toggleGenre(genre)}
                  disabled={uploading}
                  className="hidden"
                />
                <span>{genre}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select
            className="input-field"
            value={contentData.targetAgeGroup}
            onChange={(e) => setContentData({ ...contentData, targetAgeGroup: e.target.value })}
            disabled={uploading}
          >
            <option value="all">All Ages</option>
            <option value="kids">Kids (0-12)</option>
            <option value="teens">Teens (13-19)</option>
            <option value="adults">Adults (20+)</option>
          </select>
          <select
            className="input-field"
            value={contentData.targetGender}
            onChange={(e) => setContentData({ ...contentData, targetGender: e.target.value })}
            disabled={uploading}
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {/* Movie uploader */}
        {contentData.type !== 'series' && (
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files[0])}
            disabled={uploading}
          />
        )}

        {/* Series uploader: multiple episodes */}
        {contentData.type === 'series' && (
          <div className="space-y-2">
            <label className="block text-sm text-gray-300">Select Episode Files</label>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={(e) => setEpisodeFiles(Array.from(e.target.files || []))}
              disabled={uploading}
            />
            <label className="block text-sm text-gray-300">Episode Titles (optional, one per line, matched by order)</label>
            <textarea
              className="input-field text-white bg-gray-700"
              placeholder={`Episode 1 Title\nEpisode 2 Title\n...`}
              value={episodeTitles}
              onChange={(e) => setEpisodeTitles(e.target.value)}
              disabled={uploading}
            />
            <p className="text-xs text-gray-400">
              If titles are not provided, filenames will be used. You can reorder files before upload if needed.
            </p>
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={uploading}>
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </form>
    </div>
  );
}
