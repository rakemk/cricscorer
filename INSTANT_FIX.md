# ⚡ INSTANT FIX - Network Error

## The Problem
Your app can't connect because **there's no backend server running**.

## ✅ SOLUTION (30 seconds)

### 1. Open this file:
```
src/constants/config.js
```

### 2. Find line 34 (around there):
```javascript
const CURRENT_ENV = 'development';
```

### 3. Change it to:
```javascript
const CURRENT_ENV = 'mock';
```

### 4. Save the file

### 5. Reload your app
Press `r` in Expo terminal

### 6. Login with:
- Username: **333**
- Password: **1234**

## ✅ DONE!

The app now works with fake data. No backend server needed!

---

## Want Real Data Later?

See: `NO_BACKEND_SERVER_SOLUTIONS.md` for full options.
