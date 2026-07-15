import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { PitBoard } from './PitBoard'
import './index.css'

// Route the standalone PIT board at the top level so App's hooks are never
// skipped by a conditional early return (Rules of Hooks).
const isPitBoard = window.location.pathname === '/pit-board'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isPitBoard ? <PitBoard /> : <App />}
  </React.StrictMode>,
)
