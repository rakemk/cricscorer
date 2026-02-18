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
  BASE_URL: 'http://192.168.1.10:3000', // Change this to your actual API server URL
  API_VERSION: 'v2',
  TIMEOUT: 30000,
  DEBUG: true,
};
```

**Replace the `BASE_URL` with your actual API server URL.**

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
  API_VERSION: 'v2',
  TIMEOUT: 30000,
  DEBUG: false, // Disable debug logs
};
```
