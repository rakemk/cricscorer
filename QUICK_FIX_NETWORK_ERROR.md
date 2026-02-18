# 🚨 QUICK FIX - Network Error

## The Problem
```
ERROR: Network Error: Unable to connect to server
```

## ✅ SOLUTION (3 Steps)

### STEP 1: Start Your Backend Server

Your React Native app needs a backend API server running. Make sure you have:

1. **A backend API server** (Node.js/Express, etc.)
2. **Running on port 3000** (or configure different port below)

Start it with:
```bash
cd path/to/your/backend
npm start
```

### STEP 2: Config is Already Set!

Good news! The app now **auto-detects** your platform:

- ✅ **Android Emulator**: Uses `http://10.0.2.2:3000` (auto-configured)
- ✅ **iOS Simulator**: Uses `http://localhost:3000` (auto-configured)

**No changes needed if using emulator/simulator!**

### STEP 3: Restart Your App

Reload your React Native app:
- Press `r` in Expo terminal, OR
- Shake device → "Reload"

**That's it!** The network error should be gone.

---

## 📱 Using Physical Device (Phone/Tablet)?

If testing on **real device** (not simulator):

### A. Find Your Computer's IP:

**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" → e.g., `192.168.1.10`

**Mac/Linux:**
```bash
ifconfig | grep inet
```

### B. Update Config:

Open: `src/constants/config.js`

Around **line 23**, uncomment and change:
```javascript
// Change this line (line 23):
development: 'http://192.168.1.10:3000',  // ← Put YOUR IP here
```

Comment out the `Platform.select` block above it (lines 17-21).

### C. Same WiFi Network:
- Phone and computer MUST be on same WiFi
- Check firewall isn't blocking port 3000

---

## 🔍 Still Not Working?

### Check These:

**1. Backend Server Running?**
```bash
# Try accessing in browser:
http://localhost:3000/v2/auth/scorer
```
Should show API response (even if error). If page won't load, backend isn't running.

**2. Check Console Logs**
Look for this in your Expo terminal:
```
============================================================
API Configuration:
  Environment: development
  Base URL: http://10.0.2.2:3000
  Platform: android
============================================================
```

**3. Firewall?**
- Windows Firewall might block port 3000
- Try disabling temporarily to test

**4. Correct Port?**
If backend uses different port (e.g., 8080), edit `src/constants/config.js`:
```javascript
android: 'http://10.0.2.2:8080',  // Change port
ios: 'http://localhost:8080',     // Change port
```

---

## 📝 Quick Reference

| Platform | URL to Use |
|----------|-----------|
| Android Emulator | `http://10.0.2.2:3000` |
| iOS Simulator | `http://localhost:3000` |
| Physical Device | `http://YOUR_IP:3000` |
| Production | `https://api.yourserver.com` |

**File to edit**: `src/constants/config.js`

---

## 🎯 Switching to Production

When deploying to production:

Edit `src/constants/config.js` line 30:
```javascript
const CURRENT_ENV = 'production'; // Change from 'development'
```

And update line 11:
```javascript
production: 'https://your-production-api.com',
```

---

**Need more help?** Check full guide: `API_CONFIGURATION.md`
