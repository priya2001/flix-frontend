import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx'; // explicitly point to .jsx
import './index.css'; // optional - create later or remove if not using

const root = createRoot(document.getElementById('root'));
root.render(<App />);
