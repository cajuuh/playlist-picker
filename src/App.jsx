import { useEffect, useState, useCallback } from 'react';
import { getPlaylistInfo, getStatus, submitPicks } from './api.js';
import Landing from './screens/Landing.jsx';
import Search from './screens/Search.jsx';
import Review from './screens/Review.jsx';
import Success from './screens/Success.jsx';
import Locked from './screens/Locked.jsx';
import Unavailable from './screens/Unavailable.jsx';
import './App.css';

const STORAGE_KEY = 'playlist-picker:friend';

function loadStoredFriend() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeFriend(friend) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(friend));
  } catch {
    // localStorage may be unavailable (private mode); the app still works
    // for this session, the friend just has to re-enter their info next visit.
  }
}

export default function App() {
  const [screen, setScreen] = useState('loading');
  const [playlist, setPlaylist] = useState(null);
  const [friend, setFriend] = useState(null);
  const [lockedTracks, setLockedTracks] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [submitResult, setSubmitResult] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const routeAfterIdentify = useCallback(async (person) => {
    try {
      const status = await getStatus(person.phone);
      if (status.remaining <= 0) {
        setLockedTracks(status.tracks);
        setScreen('locked');
      } else {
        setScreen('search');
      }
    } catch {
      setScreen('search');
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const info = await getPlaylistInfo();
        setPlaylist(info);
      } catch {
        setScreen('unavailable');
        return;
      }

      const stored = loadStoredFriend();
      if (stored?.name && stored?.phone) {
        setFriend(stored);
        await routeAfterIdentify(stored);
      } else {
        setScreen('landing');
      }
    })();
  }, [routeAfterIdentify]);

  async function handleJoin({ name, phone }) {
    const person = { name: name.trim(), phone: phone.trim() };
    storeFriend(person);
    setFriend(person);
    await routeAfterIdentify(person);
  }

  function handleReview(tracks) {
    setSelectedTracks(tracks);
    setSubmitError('');
    setScreen('review');
  }

  function handleBackToSearch() {
    setScreen('search');
  }

  async function handleConfirm() {
    setSubmitting(true);
    setSubmitError('');
    try {
      const result = await submitPicks({
        phone: friend.phone,
        name: friend.name,
        videoIds: selectedTracks.map((t) => t.videoId),
      });
      setSubmitResult(result);
      setScreen('success');
    } catch (err) {
      if (err.status === 409) {
        const status = await getStatus(friend.phone).catch(() => null);
        setLockedTracks(status?.tracks || []);
        setScreen('locked');
      } else {
        setSubmitError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="app-frame">
        {screen === 'loading' && <div className="app-loading">Loading…</div>}
        {screen === 'unavailable' && <Unavailable />}
        {screen === 'landing' && <Landing playlist={playlist} onJoin={handleJoin} />}
        {screen === 'search' && (
          <Search
            playlist={playlist}
            initialSelected={selectedTracks}
            onReview={handleReview}
          />
        )}
        {screen === 'review' && (
          <Review
            playlist={playlist}
            tracks={selectedTracks}
            submitting={submitting}
            error={submitError}
            onBack={handleBackToSearch}
            onConfirm={handleConfirm}
          />
        )}
        {screen === 'success' && (
          <Success playlist={playlist} tracks={submitResult?.added || selectedTracks} />
        )}
        {screen === 'locked' && <Locked playlist={playlist} tracks={lockedTracks} />}
      </div>
    </div>
  );
}
