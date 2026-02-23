# API Configuration Guide

## Network Error Fix

If you're getting a **Network Error** when trying to login, you need to configure the correct API server URL.

## Steps to Fix:

### 1. Find Your API Server URL

The API server URL depends on where your backend API is running:

**Common scenarios:**

- **Local Development (Backend on same machine):**
  - If using Android Emulator: `http://10.0.2.2:3000`
  - If using iOS Simulator: `http://localhost:3000`
  - If using real device: `http://YOUR_COMPUTER_IP:3000` (e.g., `http://192.168.1.10:3000`)

- **Production Server:**
  - Example: `https://api.procric8.com`
  - Example: `https://your-domain.com`

- **Development Server:**
  - Example: `http://dev.yourserver.com:3000`

### 2. Update the Configuration

Open the file: `src/constants/config.js`

Find this section at the top:

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://139.59.17.31:8088/api', // Updated to port 8088 for Swagger API
  API_VERSION: 'v1',
  TIMEOUT: 30000,
  DEBUG: true,
};
```

**Replace the `BASE_URL` with your actual API server URL.**

**Note:** The production server uses port 8088. Swagger UI: http://139.59.17.31:8088/swagger-ui/

### 3. How to Find Your Computer's IP Address

#### On Windows:
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

#### On Mac/Linux:
```bash
ifconfig
```
Look for "inet" address.

### 4. Test Your Configuration

1. Save the changes to `config.js`
2. Restart your React Native app (stop and restart expo)
3. Try logging in again

### 5. Verify API Server is Running

Make sure your backend API server is:
- Running and accessible
- Listening on the correct port
- Not blocked by firewall
- The same network (if using local IP)

### 6. Check Console Logs

The app now has debug logging enabled. Check your console/terminal for:
- API Base URL being used
- Full request URL
- Any error details

Example log output:
```
API Base URL: http://192.168.1.10:3000
API Request: {
  method: 'POST',
  url: '/v2/auth/scorer',
  fullURL: 'http://192.168.1.10:3000/v2/auth/scorer',
  data: { username: '333', password: '1234' }
}
```

## Expected API Response

The login endpoint (`/v2/auth/scorer`) should return:

```json
{
  "status": 200,
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "token_type": "Bearer",
    ...other session data
  }
}
```

## Common Issues

1. **"Network Error: Unable to connect to server"**
   - Backend server is not running
   - Wrong IP address or port
   - Firewall blocking the connection
   - Device and server not on same network (for local development)

2. **"timeout of 30000ms exceeded"**
   - Server is too slow to respond
   - Server might be hanging
   - Try increasing TIMEOUT in config.js

3. **"401 Unauthorized"**
   - Invalid credentials
   - API endpoint expecting different data format

## Need Help?

- Check the API server logs for incoming requests
- Use a tool like Postman to test the API endpoint directly
- Make sure the endpoint is exactly: `POST /v2/auth/scorer`
- Verify request body format: `{ "username": "...", "password": "..." }`

## Disable Debug Logging (Production)

When ready for production, set `DEBUG: false` in config.js:

```javascript
export const API_CONFIG = {
  BASE_URL: 'https://your-production-api.com',
  API_VERSION: 'v1',
  TIMEOUT: 30000,
  DEBUG: false, // Disable debug logs
};
```

---

## Live Matches Integration

### Overview
The app now displays live matches at the top of the Fixtures screen. These are fetched from the new live matches API and show real-time scores.

### API Endpoints

#### 1. Get All Matches
**Endpoint:** `GET /api/v1/scorer/live-matches/details`

**Description:** Returns a list of ALL matches (not just live ones) with current scores and status.

**Important:** Despite the endpoint name containing "live-matches", this API returns matches with various statuses:
- `LIVE` - Match currently in progress
- `COMPLETED` or `END_OF_MATCH` - Match finished
- `UPCOMING` or `YET_TO_START` or `FIXTURE` - Match scheduled but not started

The app automatically filters these matches based on the selected tab (All, Live, Completed, Upcoming).

**Response:**
```json
{
  "timeStamp": "2026-02-23T06:16:15.490Z",
  "status": "Success",
  "data": [
    {
      "matchId": 1032,
      "teamName1": "Mumbai Indians",
      "teamName2": "CSK",
      "teamScore1": "185/4",
      "teamOver1": "(18.2/20)",
      "teamScore2": "170/8",
      "teamOver2": "(20/20)",
      "matchStatus": "COMPLETED",
      "matchSummary": "Mumbai won by 15 runs",
      "crr1": 10.08,
      "crr2": 8.50,
      "target": 171,
      "requiredRr": 9.85,
      "currInning": 2
    }
  ]
}
```

**Key Field:** `matchStatus` - Determines which tab the match appears in.

#### 2. Get Match Score Details
**Endpoint:** `GET /api/v1/scorer/match/{matchId}/score`

**Description:** Returns comprehensive match score data including summary, innings details, and full match information. This is used when viewing any match (live, completed, or upcoming).

**Usage:** Called when user taps on any match card to view detailed scorecard.

**Important:** This is the ONLY endpoint called when viewing a match. The app does NOT call:
- ❌ `/v1/scorer/match/{matchId}` 
- ❌ `/v1/scorer/match/{matchId}/innings`
- ❌ `/v1/scorer/match/{matchId}/balldata/{innings}`

These endpoints are not needed. The score endpoint returns everything in one response.

**Response:**
```json
{
  "timeStamp": "2026-02-23T07:36:15.102Z",
  "status": "Success",
  "data": {
    "matchId": 1032,
    "lastUpdated": "2026-02-23T07:36:15.102Z",
    "summary": {
      "teamName1": "Mumbai Indians",
      "teamName2": "CSK",
      "teamScore1": "185/4",
      "teamOver1": "(18.2/20)",
      "teamScore2": "170/8",
      "teamOver2": "(20/20)",
      "matchStatus": "LIVE",
      "matchSummary": "Mumbai needs 15 runs",
      "tossDetails": "Mumbai won toss and elected to field",
      "crr1": 10.08,
      "crr2": 8.50,
      "target": 171,
      "requiredRr": 9.85,
      "currInning": 2,
      "momId": 45,
      "momName": "Player Name",
      "teamLogo1": "url",
      "teamLogo2": "url"
    },
    "inning1": { ... },
    "inning2": { ... }
  }
}
```

### Features

#### In Fixtures Screen:
- **Smart Tab Filtering:** Matches are automatically organized by their `matchStatus` field:
  - **All Tab:** Shows all matches regardless of status
  - **Live Tab:** Shows only matches with `matchStatus: "LIVE"` or `"INNINGS_BREAK"`
  - **Completed Tab:** Shows only matches with `matchStatus: "COMPLETED"` or `"END_OF_MATCH"`
  - **Upcoming Tab:** Shows only matches with `matchStatus: "UPCOMING"`, `"YET_TO_START"`, or `"FIXTURE"`
- **Match Cards:** Display team names, scores, overs, and match summary
- **Status Badges:** Color-coded status indicators (green for LIVE, gray for COMPLETED, blue for UPCOMING)
- **Visual Styling:** Live matches have green left border and light background tint
- **Click to View:** Tap any match to see detailed scorecard from `/api/v1/scorer/match/{matchId}/score`
- **Auto-Refresh:** Pull down to refresh and get latest match data

#### In Scoreboard Screen (View Mode):
When you tap on a match from the fixtures list, the app displays comprehensive match data from the score API:

**Match Information:**
- Match header with team names and status badge
- Match summary (result or current situation)
- Toss details

**Score Details:**
- Both team scores with runs, wickets, and overs
- Current run rate for both teams
- Extras breakdown
- Target and required run rate (for 2nd innings)

**Player Statistics:**

*For Each Innings:*
- **Batting Card:** 
  - Batsman name
  - Runs scored
  - Balls faced
  - 4s and 6s hit
  - Strike rate
  - How out (dismissal details)
  
- **Bowling Figures:**
  - Bowler name  
  - Overs bowled
  - Runs conceded
  - Wickets taken
  - Economy rate

- **Fall of Wickets:** Score at each wicket

**Additional Info:**
- Man of the Match (if declared)

**API Call Flow:**
1. User taps match card → Navigate to ScoreboardScreen
2. App calls `/api/v1/scorer/match/{matchId}/score` (ONLY this endpoint)
3. Displays comprehensive match data from `summary` field
4. Shows detailed innings data from `inning1` and `inning2` objects with:
   - `batsman` array: All batsmen with their statistics
   - `bowler` array: All bowlers with their figures
   - `fow` array: Fall of wickets
   - `partnership` array: Partnership details (if available)

**No 404 Errors:** The app only calls the score endpoint, not individual match/innings/balldata endpoints.

### Usage

The live matches integration works automatically. When you open the Fixtures screen:
1. Live matches load automatically at the top
2. Pull down to refresh anytime
3. Tap any live match to view detailed scorecard
4. Regular fixtures appear below live matches

### Swagger Documentation

Full API documentation available at:
**http://139.59.17.31:8088/swagger-ui/index.html#/scorer-controller**

### Configuration

Ensure your `src/constants/config.js` has the correct port:

```javascript
const API_URLS = {
  production: 'http://139.59.17.31:8088/api', // Port 8088
};
```

### Troubleshooting

**Matches appearing in wrong tab:**

The app reads the `matchStatus` field from the API response. Check your console logs to verify:

```
🎯 Match status mapping: {
  matchId: 1032,
  originalStatus: "COMPLETED",
  mappedStatus: "COMPLETED",
  teamName1: "Mumbai Indians",
  teamName2: "CSK"
}
```

**Filter logs:**
```
🔴 Live filter applied. Total: 10 → Live only: 3
🟢 Completed filter applied. Total: 10 → Completed: 7
🟡 Upcoming filter applied. Total: 10 → Upcoming: 0
```

**Common Issues:**

1. **All matches showing in Live tab:**
   - Check if API is returning `matchStatus: "LIVE"` for all matches
   - Verify the backend is updating match status correctly

2. **Completed matches still showing as LIVE:**
   - The API must update `matchStatus` to "COMPLETED" or "END_OF_MATCH" when match ends
   - Check backend logic for status updates

3. **Matches not appearing in any tab:**
   - Verify `matchStatus` field exists in API response
   - Check console for the actual status value being returned
   - Supported statuses: LIVE, INNINGS_BREAK, COMPLETED, END_OF_MATCH, UPCOMING, YET_TO_START, FIXTURE

**Testing the API directly:**

Test the endpoint in browser or Postman:
```
GET http://139.59.17.31:8088/api/v1/scorer/live-matches/details
```

Check what `matchStatus` values are actually being returned.

**Tournament list error (404):**
If you see "Tournament endpoint not found" error:
- The app automatically creates a default "Live Matches" tournament
- This is normal if your API doesn't have a tournament endpoint
- Live matches will still display correctly
- No action needed - the app handles this automatically

**No live matches showing:**
1. Check if there are actually live matches in the backend
2. Pull down to refresh
3. Check console for API errors
4. Verify API endpoint: `http://139.59.17.31:8088/api/v1/scorer/live-matches/details`

**Live matches not updating:**
1. Pull down to refresh manually
2. Check network connection
3. Verify API server is accessible

**Can't view match details:**
1. Ensure scoreboard screen is configured
2. Check match ID is valid
3. Verify match score endpoint is accessible

## API Endpoint Compatibility

The app is designed to work with different backend configurations:

### With Full Tournament Support
If your API provides `/v1/scorer/tournament/list`:
- Tournaments load normally
- Fixtures filtered by tournament
- Live matches supplement existing fixtures

### Without Tournament Endpoint (Current Setup)
If your API only provides live matches (`/v1/scorer/live-matches/details`):
- App creates a default "Live Matches" tournament automatically
- Live matches display without requiring tournament selection
- No errors or crashes - seamless fallback
- This is the **current configuration** for Swagger API on port 8088

