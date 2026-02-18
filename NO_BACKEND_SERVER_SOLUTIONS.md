# 🚨 BACKEND SERVER NOT FOUND - SOLUTIONS

## Problem
```
Network Error: Cannot connect to API server at http://10.0.2.2:3000
```

**This means**: Your React Native app is trying to connect to a backend API server, but **there is no server running**.

---

## 🎯 QUICK SOLUTION: Use Mock Mode (No Backend Needed!)

### Step 1: Enable Mock Mode

Edit: `src/constants/config.js`

Find line ~34 and change:
```javascript
const CURRENT_ENV = 'mock'; // Change from 'development' to 'mock'
```

### Step 2: Restart App

Reload your Expo app (press `r` in terminal)

### Step 3: Login

Use these test credentials:
- **Username**: `333`
- **Password**: `1234`

**That's it!** The app will now use fake data - no backend server needed.

---

## 🔧 OTHER SOLUTIONS

### Solution 1: You Have a Backend Server

If you have a backend API server project:

1. **Start your backend server:**
   ```bash
   cd path/to/backend-project
   npm start
   ```

2. **Make sure it's running on port 3000**

3. **Keep `CURRENT_ENV = 'development'`** in config.js

4. **Reload your React Native app**

---

### Solution 2: Use Production API

If you have a live/production API server:

1. Edit `src/constants/config.js` line ~15:
   ```javascript
   production: 'https://api.yourserver.com', // Your API URL
   ```

2. Change line ~34:
   ```javascript
   const CURRENT_ENV = 'production';
   ```

3. Reload app

---

### Solution 3: Create Your Own Backend (Advanced)

You need to create a backend API server that handles these endpoints:

**Required Endpoints:**
- `POST /v2/auth/scorer` - Login endpoint
  - Request: `{ username: string, password: string }`
  - Response: `{ data: { access_token, refresh_token, token_type, user } }`

- `GET /v2/scorer/tournament/list` - Get tournaments
- `GET /v2/scorer/tournament/:id/fixture/list` - Get fixtures
- And other endpoints from `src/constants/config.js`

**Example using Node.js/Express:**

Create a new folder for backend:
```bash
mkdir cric-scorer-backend
cd cric-scorer-backend
npm init -y
npm install express cors body-parser
```

Create `server.js`:
```javascript
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Login endpoint
app.post('/v2/auth/scorer', (req, res) => {
  const { username, password } = req.body;
  
  if (username === '333' && password === '1234') {
    res.json({
      data: {
        access_token: 'sample_token_123',
        refresh_token: 'refresh_token_456',
        token_type: 'Bearer',
        user: {
          id: 1,
          username: '333',
          name: 'Test User'
        }
      }
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Tournament list
app.get('/v2/scorer/tournament/list', (req, res) => {
  res.json({
    data: [
      { id: 1, name: 'Test Tournament 2026' }
    ]
  });
});

app.listen(3000, () => {
  console.log('Backend server running on port 3000');
});
```

Start the server:
```bash
node server.js
```

Then set `CURRENT_ENV = 'development'` in config.js.

---

## 📊 Comparison Table

| Solution | Pros | Cons | Best For |
|----------|------|------|----------|
| **Mock Mode** | ✅ No setup needed<br>✅ Works immediately<br>✅ Good for testing UI | ❌ Fake data<br>❌ Limited functionality | Testing, Development without backend |
| **Local Backend** | ✅ Real data<br>✅ Full control | ❌ Need to build backend<br>❌ Setup required | Full development |
| **Production API** | ✅ Real data<br>✅ No local setup | ❌ Requires existing API<br>❌ May need authentication | Already have backend |

---

## 🔍 How to Check What You Have

### Do you have a backend server project?

Look for:
- A separate folder with `server.js` or `app.js`
- A folder with Express, Koa, or similar Node.js framework
- Docker containers running backend
- Any API documentation

**If NO:** Use **Mock Mode** (Solution 1)

**If YES:** Use that backend server (Solution 2)

---

## 💡 Recommended Approach

**For Quick Testing:**
└─ Use **Mock Mode** ✅

**For Full Development:**
└─ Create or use existing backend server

**For Production:**
└─ Deploy backend API → Use production URL

---

## 🆘 Still Having Issues?

### Check Console Output

Look for this in your terminal:
```
============================================================
API Configuration:
  Environment: mock
  Base URL: http://mock-api
  Platform: android
  Mock Mode: ENABLED ✅
============================================================

🔶 Mock API Mode Active
   Using fake data - no backend server needed
   Test credentials: username=333, password=1234
```

If you see this, Mock Mode is working!

### Common Issues

**1. Still getting network error in Mock Mode?**
- Make sure you changed `CURRENT_ENV = 'mock'`
- Restart the Expo app completely
- Check console for "Mock Mode: ENABLED"

**2. Mock login not working?**
- Use exact credentials: `333` / `1234`
- Check console for mock API logs

**3. Want to switch back to real API?**
- Change `CURRENT_ENV = 'development'` or `'production'`
- Make sure backend server is running

---

## 📝 Summary

**Right Now, You Have 3 Options:**

1. **🔶 Enable Mock Mode** (Easiest - Recommended for testing)
   - Edit config.js → `CURRENT_ENV = 'mock'`
   - Login with: 333 / 1234

2. **🚀 Run Backend Server** (If you have one)
   - Start backend on port 3000
   - Keep `CURRENT_ENV = 'development'`

3. **🌐 Use Production API** (If available)
   - Set production URL in config.js
   - Change `CURRENT_ENV = 'production'`

**Choose Option 1 to test the app immediately!**
