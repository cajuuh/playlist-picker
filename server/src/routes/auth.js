import { Router } from 'express';
import { getAuthUrl, handleOAuthCallback, isAuthorized } from '../youtube.js';

const router = Router();

router.get('/google', (req, res) => {
  res.redirect(getAuthUrl());
});

router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error) return res.status(400).send(`Google denied access: ${error}`);
  if (!code) return res.status(400).send('Missing authorization code');
  try {
    await handleOAuthCallback(code);
    res.send('YouTube account connected! You can close this tab and go back to the app.');
  } catch (err) {
    console.error('OAuth callback failed:', err);
    res.status(500).send(`Failed to connect YouTube account: ${err.message}`);
  }
});

router.get('/status', (req, res) => {
  res.json({ authorized: isAuthorized() });
});

export default router;
