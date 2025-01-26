const clientId = '18f14aa15de04555bb6265565305ef67';
const redirectUri = 'http://localhost:3000';
const tokenEndpoint = "https://accounts.spotify.com/api/token"

const scope = 'user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private';
const authUrl = new URL("https://accounts.spotify.com/authorize");

// Code for PKCE token generation and authentication
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

const sha256 = async (plain) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return window.crypto.subtle.digest('SHA-256', data)
}

const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const authorize = async () => {
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);
  window.localStorage.setItem('code_verifier', codeVerifier);

  const params = {
    response_type: 'code',
    client_id: clientId,
    scope,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  }

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();
}

export const getToken = async code => {
  // stored in the previous step
  let codeVerifier = localStorage.getItem('code_verifier');

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  }

  const body = await fetch(tokenEndpoint, payload);
  const response = await body.json();
  return response;
}

// Generic function for hitting Spotify endpoints
const fetchWebApi = async (token, endpoint, method, body) => {
  const payload = {
    method,
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  }
  const res = await fetch(`https://api.spotify.com/${endpoint}`, payload);
  return await res.json();
}

const getTopArtists = async (token) => {
  return (await fetchWebApi(
    token, 'v1/me/top/artists?&limit=5', 'GET'
  )).items;
}

const createPlaylist = async (token, user_id, name, tracks_uri) => {
  const body = {
    "name": name,
    "description": "Playlist created by student project VizzyBeats",
    "public": false
  }
  const playlist = await fetchWebApi(
    token, `v1/users/${user_id}/playlists`, 'POST', body
  );

  await fetchWebApi(token, `v1/playlists/${playlist.id}/tracks?uris=${tracks_uri.join(',')}`, 'POST');
  return playlist;
}

// This request combines a query and genre to search for playlists.
// In theory, the query is a label from an image, and the genre is from the users' top genres.
const getPlaylists = async (token, query, genre, limit) => {
  let playlists = [];

  while (playlists.length < limit) {
    const response = (await fetchWebApi(
      token, `v1/search?&q=${query}%20${genre}&type=playlist&market=ES&limit=10&offset=2`, 'GET'
    )).playlists.items;
    const valid_playlists = response.filter(item => item !== null);
    playlists = playlists.concat(valid_playlists);
  }
  return playlists.slice(0, limit);
}

const getTrackUris = async (token, id) => {
  return (await fetchWebApi(
    token, `v1/playlists/${id}?market=ES`, 'GET'
  )).tracks?.items?.map(item => item.track.uri);
}

const extractUris = async (token, playlistIds, limit) => {
  let uris = []
  for (const id of playlistIds) {
    const tracks = await getTrackUris(token, id);

    // Small playlist handler
    if (tracks.length <= limit) {
      uris = uris.concat(tracks)
      continue;
    }

    // Fisher-Yates Shuffle for random selection
    for (let i = 0; i < limit; i++) {
      const randomIndex = i + Math.floor(Math.random() * (tracks.length - i));
      [tracks[i], tracks[randomIndex]] = [tracks[randomIndex], tracks[i]];
      uris.push(tracks[i]);
    }
  }
  return uris;
}

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Get a random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]];  // Swap elements
  }
  return array;
}

export const generatePlaylist = async (labels) => {
  const access_token = localStorage.getItem('access_token')
  if (access_token) {
    // Get the top genres for the users, to help with recommendations
    const top_artists = await getTopArtists(access_token);
    const top_genres = top_artists.map(item => item.genres).flat();

    // Scrape the URIs for building the playlist
    let uris = [];
    for (const label of labels) {
      const random_genre = top_genres[Math.floor(Math.random() * top_genres.length)];
      const playlists = await getPlaylists(access_token, label, random_genre, 3);
      const playlist_ids = playlists.map(item => item.id);
      uris = uris.concat(await extractUris(access_token, playlist_ids, 5));
    }

    // Playlist creation
    uris = shuffleArray(uris);
    const { id: user_id } = await fetchWebApi(access_token, 'v1/me', 'GET');
    const playlist_name = labels.concat(["jams"]).join(" ").toLowerCase();
    const playlist = await createPlaylist(access_token, user_id, playlist_name, uris);
    return playlist.id;
  } else {
    console.error("access token not found.")
  }
}

// Buttons to handle clicks
export const authorizeClick = () => {
  authorize();
}
