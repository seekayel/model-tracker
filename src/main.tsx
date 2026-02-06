import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Home from './pages/Home';
import V1Gallery from './pages/V1Gallery';
import V2Gallery from './pages/V2Gallery';
import V3Gallery from './pages/V3Gallery';
import V4Gallery from './pages/V4Gallery';
import V5Gallery from './pages/V5Gallery';
import V6Gallery from './pages/V6Gallery';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/v1" element={<V1Gallery />} />
        <Route path="/v2" element={<V2Gallery />} />
        <Route path="/v3" element={<V3Gallery />} />
        <Route path="/v4" element={<V4Gallery />} />
        <Route path="/v5" element={<V5Gallery />} />
        <Route path="/v6" element={<V6Gallery />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
);
