import { handleOAuthCallback } from '../_lib/youtube.js';

export default async function handler(req, res) {
  const { code, error } = req.query;
  if (error) return res.status(400).send(`Google denied access: ${error}`);
  if (!code) return res.status(400).send('Missing authorization code');
  try {
    await handleOAuthCallback(code);
    res.status(200).send('YouTube account connected! You can close this tab and go back to the app.');
  } catch (err) {
    console.error('OAuth callback failed:', err);
    res.status(500).send(`Failed to connect YouTube account: ${err.message}`);
  }
}
