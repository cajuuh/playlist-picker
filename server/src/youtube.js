import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKEN_FILE = path.join(__dirname, '..', 'data', 'token.json');
const SCOPES = ['https://www.googleapis.com/auth/youtube'];

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

function readTokenFile() {
  try {
    return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

function writeTokenFile(tokens) {
  fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true });
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
}

// Google may only send a refresh_token on the very first consent; merge so
// later access-token-only refreshes don't clobber the stored refresh_token.
oauth2Client.on('tokens', (tokens) => {
  const existing = readTokenFile() || {};
  writeTokenFile({ ...existing, ...tokens });
});

const stored = readTokenFile();
if (stored) {
  oauth2Client.setCredentials(stored);
}

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
  writeTokenFile(tokens);
}

export function isAuthorized() {
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
  const playlistId = process.env.YOUTUBE_PLAYLIST_ID;
  const res = await youtube.playlists.list({ part: ['snippet'], id: [playlistId] });
  const item = res.data.items?.[0];
  return {
    name: item?.snippet?.title || 'The Playlist',
    url: `https://music.youtube.com/playlist?list=${playlistId}`,
  };
}
