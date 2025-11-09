import React, { useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [file, setFile] = useState(null);
  const [contentData, setContentData] = useState({
    title: '',
    description: '',
    type: 'movie',
    genre: [],
    releaseYear: ''
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('video', file);
    formData.append('data', JSON.stringify(contentData));

    try {
      await axios.post('/api/content/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Content uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Upload New Content</h2>
      <form onSubmit={handleUpload}>
        <input
          type="text"
          placeholder="Title"
          onChange={(e) => setContentData({...contentData, title: e.target.value})}
        />
        <textarea
          placeholder="Description"
          onChange={(e) => setContentData({...contentData, description: e.target.value})}
        />
        <select onChange={(e) => setContentData({...contentData, type: e.target.value})}>
          <option value="movie">Movie</option>
          <option value="series">Series</option>
        </select>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default AdminDashboard;
