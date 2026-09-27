import { google } from 'googleapis';
import { supabase } from './supabase.js';

const SCOPES = ['https://www.googleapis.com/auth/youtube'];

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

// Serverless functions are stateless between invocations, so this cache is
// just a same-invocation optimization — Supabase is the actual source of
// truth and gets re-read on every cold start via ensureLoaded().
let cachedTokens = null;
let loaded = false;

async function ensureLoaded() {
  if (loaded) return;
  const { data, error } = await supabase
    .from('youtube_auth')
    .select('tokens')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  cachedTokens = data?.tokens || null;
  if (cachedTokens) oauth2Client.setCredentials(cachedTokens);
  loaded = true;
}

async function persistTokens(tokens) {
  cachedTokens = { ...(cachedTokens || {}), ...tokens };
  oauth2Client.setCredentials(cachedTokens);
  const { error } = await supabase
    .from('youtube_auth')
    .upsert({ id: 1, tokens: cachedTokens, updated_at: new Date().toISOString() });
  if (error) console.error('Failed to persist YouTube token:', error.message);
}

// Google may only send a refresh_token on the very first consent; merging
// via persistTokens means a later access-token-only refresh doesn't
// clobber the stored refresh_token.
oauth2Client.on('tokens', (tokens) => {
  persistTokens(tokens).catch((err) => console.error('Token persist failed:', err.message));
});

export function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
}

export async function handleOAuthCallback(code) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  await persistTokens(tokens);
}

export async function isAuthorized() {
  await ensureLoaded();
  return Boolean(oauth2Client.credentials?.refresh_token);
}

function formatDuration(iso) {
  if (!iso) return '';
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  const totalMinutes = hours * 60 + minutes;
  return `${totalMinutes}:${String(seconds).padStart(2, '0')}`;
}

export async function searchTracks(query) {
  await ensureLoaded();
  const searchRes = await youtube.search.list({
    part: ['snippet'],
    q: query,
    type: ['video'],
    videoCategoryId: '10', // Music
    maxResults: 12,
  });

  const items = (searchRes.data.items || []).filter((item) => item.id?.videoId);
  const ids = items.map((item) => item.id.videoId);
  if (ids.length === 0) return [];

  const videosRes = await youtube.videos.list({
    part: ['contentDetails'],
    id: ids,
  });
  const durationById = new Map(
    (videosRes.data.items || []).map((v) => [v.id, v.contentDetails.duration])
  );

  return items.map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
    duration: formatDuration(durationById.get(item.id.videoId)),
  }));
}

export async function getVideoDetails(videoId) {
  await ensureLoaded();
  const res = await youtube.videos.list({ part: ['snippet'], id: [videoId] });
  const item = res.data.items?.[0];
  if (!item) throw new Error('Video not found');
  return {
    videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
  };
}

export async function addToPlaylist(videoId) {
  await ensureLoaded();
  await youtube.playlistItems.insert({
    part: ['snippet'],
    requestBody: {
      snippet: {
        playlistId: process.env.YOUTUBE_PLAYLIST_ID,
        resourceId: { kind: 'youtube#video', videoId },
      },
    },
  });
}

export async function getPlaylistInfo() {
  await ensureLoaded();
  const playlistId = process.env.YOUTUBE_PLAYLIST_ID;
  const res = await youtube.playlists.list({
    part: ['snippet', 'contentDetails'],
    id: [playlistId],
  });
  const item = res.data.items?.[0];
  const thumbs = item?.snippet?.thumbnails || {};
  const coverUrl =
    (thumbs.maxres || thumbs.standard || thumbs.high || thumbs.medium || thumbs.default)?.url ||
    '';
  return {
    name: item?.snippet?.title || 'The Playlist',
    url: `https://music.youtube.com/playlist?list=${playlistId}`,
    // YouTube hands back a grey "no_thumbnail" placeholder for art-less
    // playlists — treat that as no cover so the UI uses its own fallback.
    cover: coverUrl.includes('no_thumbnail') ? '' : coverUrl,
    trackCount: item?.contentDetails?.itemCount ?? null,
  };
}
