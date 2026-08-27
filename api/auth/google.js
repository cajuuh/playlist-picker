import { getAuthUrl } from '../_lib/youtube.js';

export default function handler(req, res) {
  res.redirect(getAuthUrl());
}
