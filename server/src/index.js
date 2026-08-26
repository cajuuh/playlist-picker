import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import playlistRoutes from './routes/playlist.js';
import searchRoutes from './routes/search.js';
import statusRoutes from './routes/status.js';
import submitRoutes from './routes/submit.js';
import { isAuthorized } from './youtube.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api/playlist', playlistRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/submit', submitRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set — see README for setup.');
  } else if (!isAuthorized()) {
    console.warn(
      `YouTube account not connected yet. Open http://localhost:${PORT}/auth/google and sign in.`
    );
  }
});
