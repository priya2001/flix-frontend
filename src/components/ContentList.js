import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ContentList = () => {
  const [content, setContent] = useState([]);
  const [filter, setFilter] = useState({ type: 'all', genre: 'all' });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await axios.get('/api/content', { params: filter });
        setContent(data);
      } catch (error) {
        console.error('Failed to fetch content:', error);
      }
    };

    fetchContent();
  }, [filter]);

  return (
    <div className="content-grid">
      <div className="filters">
        <select onChange={(e) => setFilter({...filter, type: e.target.value})}>
          <option value="all">All Types</option>
          <option value="movie">Movies</option>
          <option value="series">Series</option>
        </select>
      </div>
      
      <div className="content-list">
        {content.map((item) => (
          <Link to={`/watch/${item._id}`} key={item._id} className="content-card">
            <img src={item.thumbnailUrl} alt={item.title} />
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ContentList;
