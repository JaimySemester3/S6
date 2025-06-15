import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import './App.css';

function App() {
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

  useEffect(() => {
    const fetchEmailFromToken = async () => {
      try {
        const token = await getAccessTokenSilently();
        const decoded = jwtDecode(token);
        const emailClaim = decoded['https://yourapp.com/email'];
        setUserEmail(emailClaim);
      } catch (err) {
        console.error('❌ Failed to decode token:', err);
      }
    };

    if (isAuthenticated) fetchEmailFromToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  const postTweet = async () => {
    try {
      const token = await getAccessTokenSilently();

      const res = await fetch('/tweets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: 'Hello from Vite!' }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("❌ Tweet POST failed:", data);
      }
    } catch (err) {
      console.error("❌ Tweet error:", err);
    }
  };

  const fetchTimeline = async () => {
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`/timeline/${encodeURIComponent(userEmail)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setTimeline(data.data || []);
    } catch (error) {
      console.error('❌ Timeline error:', error);
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Tweet timeline</h1>

      {!isAuthenticated ? (
        <button onClick={() => loginWithRedirect()}>🔐 Log In</button>
      ) : (
        <>
          <p>Logged in as <strong>{userEmail || user.name}</strong></p>
          <button onClick={() => logout({ returnTo: window.location.origin })}>
            Log Out
          </button>

          <div style={{ marginTop: '2rem' }}>
            <button onClick={postTweet} style={{ marginRight: '1rem' }}>
              ➕ Post Tweet
            </button>

            <button onClick={fetchTimeline}>
              Fetch Timeline
            </button>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h2>Timeline:</h2>
            {timeline.length > 0 ? (
              <ul>
                {timeline.map((tweet, index) => (
                  <li key={index}>
                    <strong>{tweet.author}</strong>: {tweet.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No tweets yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
