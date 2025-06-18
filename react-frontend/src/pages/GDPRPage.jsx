import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';

function GDPRPage() {
  const { getAccessTokenSilently, logout } = useAuth0();
  const [userTweets, setUserTweets] = useState([]);
  const [status, setStatus] = useState('');

  const fetchMyTweets = async () => {
    setStatus('Fetching tweets...');
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch('/tweets/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const tweets = data.data || [];
      setUserTweets(tweets);
      setStatus(`Fetched ${tweets.length} tweets.`);

      // Automatically trigger download
      const blob = new Blob([JSON.stringify(tweets, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'my-tweets.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('❌ Failed to fetch tweets:', err);
      setStatus('Failed to fetch tweets');
    }
  };

  const deleteMyTweets = async () => {
    const confirm = window.confirm('Are you sure you want to delete your data? This action is permanent.');
    if (!confirm) return;

    setStatus('Deleting personal data...');
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch('/tweets', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setUserTweets([]);
        setStatus('✅ All personal data has been deleted. Logging you out...');
        setTimeout(() => {
          logout({ returnTo: window.location.origin });
        }, 1500);
      } else {
        const data = await res.json();
        setStatus(`❌ Deletion failed: ${data.message}`);
      }
    } catch (err) {
      console.error('❌ Error deleting tweets:', err);
      setStatus('❌ Error deleting tweets');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1>🛡️ GDPR Data Management</h1>
      <p>You can download or delete your personal tweet data here.</p>

      <div style={{ marginBottom: '1.5rem' }}>
        <button onClick={fetchMyTweets} style={{ marginRight: '1rem' }}>
          📥 Download My Data
        </button>
        <button
          onClick={deleteMyTweets}
          style={{ backgroundColor: 'red', color: 'white' }}
        >
          🗑️ Delete My Data
        </button>
      </div>

      {status && <p style={{ marginTop: '1rem' }}>{status}</p>}

      {userTweets.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Your Data:</h3>
          <ul>
            {userTweets.map((tweet) => (
              <li key={tweet.id}>
                {tweet.text} <em>({new Date(tweet.createdAt).toLocaleString()})</em>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default GDPRPage;
