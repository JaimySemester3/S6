import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import ConsentPopup from '../components/ConsentPopup';
import './Home.css';

const API_BASE = import.meta.env.VITE_API_URL;

function Home() {
  const {
    loginWithRedirect,
    logout,
    isAuthenticated,
    user,
    getAccessTokenSilently,
    isLoading,
  } = useAuth0();

  const [timeline, setTimeline] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [showConsentPopup, setShowConsentPopup] = useState(false);
  const [tweetContent, setTweetContent] = useState('');

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = await getAccessTokenSilently();
        const decoded = jwtDecode(token);
        const emailClaim = decoded['https://yourapp.com/email'];
        setUserEmail(emailClaim);

        const consentRes = await fetch(`${API_BASE}/user/consent`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const consentData = await consentRes.json();
        if (!consentRes.ok || !consentData?.consentGiven) {
          setShowConsentPopup(true);
        } else {
          setShowConsentPopup(false);
          fetchTimeline(token);
        }
      } catch (err) {
        console.error('❌ Initialization error:', err);
        setShowConsentPopup(true);
      }
    };

    if (isAuthenticated) initialize();
  }, [isAuthenticated, getAccessTokenSilently]);

  const fetchTimeline = async (tokenParam) => {
    try {
      const token = tokenParam || await getAccessTokenSilently();
      const res = await fetch(`${API_BASE}/timeline/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setTimeline(data.data || []);
    } catch (error) {
      console.error('❌ Timeline error:', error);
    }
  };

  const postTweet = async () => {
    if (!tweetContent.trim()) return;
    try {
      const token = await getAccessTokenSilently();

      const res = await fetch(`${API_BASE}/tweets`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: tweetContent }),
      });

      if (res.ok) {
        setTweetContent('');
        fetchTimeline(token);
      } else {
        const data = await res.json();
        console.error("❌ Tweet POST failed:", data);
      }
    } catch (err) {
      console.error("❌ Tweet error:", err);
    }
  };

  const handleConsentAccept = async () => {
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${API_BASE}/user/consent`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ consentGiven: true })
      });

      if (res.ok) {
        setShowConsentPopup(false);
        fetchTimeline(token);
      } else {
        console.error('❌ Failed to store consent');
      }
    } catch (err) {
      console.error('❌ Consent POST error:', err);
    }
  };

  if (isLoading) return <p className="loading">Loading...</p>;

  if (!isAuthenticated) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h1>🐦 <strong>TweetApp</strong></h1>
          <p>Please log in to view and post tweets.</p>
          <button className="login-btn" onClick={() => loginWithRedirect()}>
            🔐 Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1>🐦 TweetApp</h1>
        <div className="user-info">
          <p>Welcome, <strong>{userEmail || user.name}</strong></p>
          <button onClick={() => logout({ returnTo: window.location.origin })}>
            Log Out
          </button>
        </div>
      </header>

      <section className="timeline">
        <h2>Your Timeline</h2>
        {timeline.length > 0 ? (
          <ul className="tweet-list">
            {timeline.map((tweet, index) => (
              <li key={index} className="tweet">
                <div className="tweet-header">
                  <span className="author">{tweet.author}</span>
                  <span className="timestamp">{new Date(tweet.createdAt).toLocaleString()}</span>
                </div>
                <div className="tweet-body">{tweet.text}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-tweets">No tweets yet.</p>
        )}
      </section>

      <section className="composer">
        <textarea
          placeholder="What's on your mind?"
          value={tweetContent}
          onChange={(e) => setTweetContent(e.target.value)}
          rows={3}
        />
        <button onClick={postTweet}>Tweet</button>
      </section>

      {showConsentPopup && (
        <ConsentPopup
          onConsent={handleConsentAccept}
          onReject={() => logout({ returnTo: window.location.origin })}
        />
      )}
    </div>
  );
}

export default Home;
