import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [timeline, setTimeline] = useState([]);

  const postTweet = async () => {
    const res = await fetch('/tweets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: 'Hello from Vite!', author: 'jaimy' })
    });

    const data = await res.json();
    console.log('Tweet response:', data);
  };

  const fetchTimeline = async () => {
    const res = await fetch('/timeline/jaimy');
    const data = await res.json();
    console.log('Timeline response:', data);
    setTimeline(data.timeline || []);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Vite + React Frontend</h1>

      <button onClick={postTweet} style={{ marginRight: '1rem' }}>
        ➕ Post Tweet
      </button>

      <button onClick={fetchTimeline}>
        📄 Fetch Timeline
      </button>

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
    </div>
  );
}

export default App;

