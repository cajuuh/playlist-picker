import { useEffect, useState } from 'react';
import { getPlaylistInfo, getStatus, submitPicks } from './api.js';
import Intro, { INTRO_MIN_MS, INTRO_EXIT_MS } from './screens/Intro.jsx';
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

// Decides which screen a known friend lands on. Shared by the instant "Let's go"
// join and the delayed boot sequence so the two can't silently diverge.
async function determineRoute(person) {
  try {
    const status = await getStatus(person.phone);
    if (status.remaining <= 0) {
      return { screen: 'locked', lockedTracks: status.tracks };
    }
    return { screen: 'search' };
  } catch {
    return { screen: 'search' };
  }
}

export default function App() {
  const [screen, setScreen] = useState('loading');
  const [introExiting, setIntroExiting] = useState(false);
  const [playlist, setPlaylist] = useState(null);
  const [friend, setFriend] = useState(null);
  const [lockedTracks, setLockedTracks] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [submitResult, setSubmitResult] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const startedAt = Date.now();

    (async () => {
      let target = 'landing';
      let nextPlaylist = null;
      let nextFriend = null;
      let nextLockedTracks = [];

      try {
        nextPlaylist = await getPlaylistInfo();
      } catch {
        target = 'unavailable';
      }

      if (target !== 'unavailable') {
        const stored = loadStoredFriend();
        if (stored?.name && stored?.phone) {
          nextFriend = stored;
          const route = await determineRoute(stored);
          target = route.screen;
          if (route.lockedTracks) nextLockedTracks = route.lockedTracks;
        }
      }

      // Hold the intro in its looping steady state until it has been up for at
      // least INTRO_MIN_MS — on a slow fetch it just keeps drifting, never freezes.
      const elapsed = Date.now() - startedAt;
      if (elapsed < INTRO_MIN_MS) {
        await new Promise((resolve) => setTimeout(resolve, INTRO_MIN_MS - elapsed));
      }
      if (cancelled) return;

      setPlaylist(nextPlaylist);
      if (nextFriend) setFriend(nextFriend);
      if (nextLockedTracks.length) setLockedTracks(nextLockedTracks);
      setIntroExiting(true);

      setTimeout(() => {
        if (cancelled) return;
        setScreen(target);
        setIntroExiting(false);
      }, INTRO_EXIT_MS);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleJoin({ name, phone }) {
    const person = { name: name.trim(), phone: phone.trim() };
    storeFriend(person);
    setFriend(person);
    const route = await determineRoute(person);
    if (route.lockedTracks) setLockedTracks(route.lockedTracks);
    setScreen(route.screen);
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

  // On desktop the layout splits into a poster pane + a content column. The
  // poster pane needs the playlist to have loaded and isn't shown for the
  // pre-app states (intro, host-not-ready).
  const showBrand = !!playlist && screen !== 'loading' && screen !== 'unavailable';

  return (
    <div className={`app-shell${showBrand ? ' app-shell--split' : ''}`}>
      {showBrand && (
        <aside className="brand-pane">
          <div className="brand-aurora brand-aurora--a" />
          <div className="brand-aurora brand-aurora--b" />
          <div className="brand-aurora brand-aurora--c" />
          <div className="brand-inner">
            <div className="brand-cover">
              <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
                <path d="M9 18V6l11-2v12" stroke="oklch(98% 0.01 280)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="6" cy="18" r="3" stroke="oklch(98% 0.01 280)" strokeWidth="1.6" />
                <circle cx="17" cy="16" r="3" stroke="oklch(98% 0.01 280)" strokeWidth="1.6" />
              </svg>
            </div>
            <p className="display brand-title">{playlist?.name || 'The Playlist'}</p>
            <p className="brand-tagline">Everyone gets 2 picks. Make them count.</p>
          </div>
        </aside>
      )}

      <main className="app-frame">
        {screen === 'loading' && <Intro exiting={introExiting} />}
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
      </main>
    </div>
  );
}
