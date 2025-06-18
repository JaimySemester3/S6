import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Home from './pages/Home';
import GDPRPage from './pages/GDPRPage';
import './App.css';

function App() {
  const { isAuthenticated } = useAuth0();

  return (
    <Router>
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        {isAuthenticated && (
          <nav style={{ marginBottom: '1rem' }}>
            <Link to="/" style={{ marginRight: '1rem' }}>🏠 Home</Link>
            <Link to="/gdpr">🛡️ GDPR</Link>
          </nav>
        )}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gdpr" element={<GDPRPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
