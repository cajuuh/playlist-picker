# Playlist Picker

Let friends add 2 songs each to a YouTube Music playlist you own. Friends
identify themselves with just a name + phone number (no OTP, no Google
login) — the app itself holds *your* YouTube authorization and adds their
picks on your behalf, enforcing the 2-song limit per phone number.

- `client/` — React (Vite) frontend
- `server/` — Express backend: YouTube Data API v3 search, playlist inserts,
  and a small local JSON store tracking who's used their picks

## 1. Create a Google Cloud project + OAuth credentials

You (the playlist owner) need to authorize this app to manage your YouTube
playlist. This is a one-time setup only you do — friends never touch Google.

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) and
   create a new project (or pick an existing one).
2. In the sidebar, go to **APIs & Services > Library**, search for
   **YouTube Data API v3**, and click **Enable**.
3. Go to **APIs & Services > OAuth consent screen**.
   - User type: **External** (unless you have a Google Workspace org).
   - Fill in an app name (e.g. "Playlist Picker"), your email for support
     and developer contact.
   - On the **Scopes** step you can skip adding scopes here — the app
     requests them directly.
   - On the **Test users** step, add your own Google account's email. While
     the app is in "Testing" mode, only test users can authorize it — that's
     fine, since only you need to authorize.
4. Go to **APIs & Services > Credentials > Create Credentials > OAuth client
   ID**.
   - Application type: **Web application**.
   - Name: anything, e.g. "Playlist Picker server".
   - Under **Authorized redirect URIs**, add:
     `http://localhost:4000/auth/google/callback`
   - Click **Create**. Copy the **Client ID** and **Client Secret** shown.

## 2. Find your playlist ID

Open your playlist in YouTube Music or YouTube, and copy the ID from the
URL: `https://music.youtube.com/playlist?list=THIS_PART_HERE`.

## 3. Configure the server

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and fill in `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
and `YOUTUBE_PLAYLIST_ID` from steps 1–2.

## 4. Install and run

In one terminal:

```bash
cd server
npm install
npm run dev
```

In another terminal:

```bash
cd client
npm install
npm run dev
```

The client runs at `http://localhost:5173`, the server at
`http://localhost:4000`.

## 5. Connect your YouTube account (one time)

With the server running, open **http://localhost:4000/auth/google** in your
browser and sign in with the Google account that owns the playlist. Approve
the consent screen (it may warn the app is unverified — click **Advanced >
Go to Playlist Picker (unsafe)**, this is expected for a personal app in
testing mode). You'll see a confirmation page when it's done.

The server stores the authorization in `server/data/token.json` (gitignored)
and refreshes it automatically — you shouldn't need to redo this unless you
delete that file or revoke access.

## 6. Share it with friends

Open `http://localhost:5173` on your own network and share that address
with friends on the same Wi-Fi, or deploy the app somewhere public if you
want friends to reach it outside your network (not set up yet — ask if you
want help with that).

## How the 2-song limit works

Every submission is keyed by phone number on the server (`server/data/
submissions.json`, gitignored). The check-and-reserve happens synchronously
before any network call to YouTube, so two friends (or one friend refreshing
twice) can't both slip past the limit. If a friend's phone already has 2
songs, the app shows them a locked-out screen with what they added instead
of the search flow.

## Notes on API quota

The YouTube Data API's default quota is 10,000 units/day. Searching costs
~101 units and adding a song costs ~50 units per request, so this comfortably
supports normal party-sized usage (dozens of friends). If you hit the quota,
Google Cloud Console shows usage under **APIs & Services > YouTube Data API
v3 > Quotas**.
