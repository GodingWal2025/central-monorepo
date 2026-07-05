import React from 'react';
import ReactDOM from 'react-dom/client';
import { setOntologyApiBase } from '@gxo/semantic';
import App from './App';
import './index.css';

// Point the shared ontology client at our API
setOntologyApiBase('/api');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
