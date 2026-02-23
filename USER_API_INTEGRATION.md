# User Controller API Integration

All user-related APIs have been successfully integrated into CricScorerRN-Expo.

## 📦 What Was Added

### 1. API Endpoints ([config.js](src/constants/config.js))

Added `ENDPOINTS.USER` with 11 endpoints:

```javascript
USER: {
  // Profile
  GET_PROFILE: '/v1/user/profile',
  UPDATE_PROFILE: '/v1/user/profile',
  
  // Cricket Profile
  GET_CRIC_PROFILE: '/v1/user/cric-profile',
  UPDATE_CRIC_PROFILE: '/v1/user/cric-profile',
  
  // Stats
  GET_STATS: '/v1/user/stats',
  GET_TOUR_STATS: (tourId) => `/v1/user/tour/${tourId}/stats`,
  GET_PLAYER_STATS: (tourId, playerId) => `/v1/user/tour/${tourId}/player/${playerId}/stats`,
  
  // Invitations
  GET_INVITE_DETAILS: '/v1/user/invite-details',
  GET_RECEIVED_INVITATIONS: '/v1/user/invitations/received',
  ACCEPT_INVITATION: (tourId, inviteId, status) => `/v1/user/tour/${tourId}/invite/${inviteId}/accept/${status}`,
  
  // Payment
  CAPTURE_PAYMENT: '/v1/user/payment/capture',
}
```

### 2. User Service ([src/services/userService.js](src/services/userService.js))

Service layer with 11 methods:
- ✅ `getUserProfile(forceRefresh)` - Get user profile with caching
- ✅ `updateUserProfile(profileData)` - Update user profile
- ✅ `getCricketProfile(forceRefresh)` - Get cricket profile with caching
- ✅ `updateCricketProfile(cricProfileData)` - Update cricket profile
- ✅ `getUserStats()` - Get overall user stats
- ✅ `getTournamentStats(tourId)` - Get tournament-specific stats
- ✅ `getPlayerStats(tourId, playerId)` - Get player stats
- ✅ `getInviteDetails()` - Get current invite details
- ✅ `getReceivedInvitations()` - Get all received invitations
- ✅ `respondToInvitation(tourId, inviteId, status)` - Accept/decline invitation
- ✅ `capturePayment(paymentData)` - Capture Razorpay payment

**Features:**
- Smart caching with AsyncStorage
- Background refresh for profiles
- Error handling with cache fallback
- Cache management methods

### 3. Redux State Management ([src/store/slices/userSlice.js](src/store/slices/userSlice.js))

Redux slice with 10 async thunks and 6 actions:
- ✅ `fetchUserProfile` - Fetch user profile
- ✅ `updateUserProfile` - Update user profile
- ✅ `fetchCricketProfile` - Fetch cricket profile  
- ✅ `updateCricketProfile` - Update cricket profile
- ✅ `fetchUserStats` - Fetch overall stats
- ✅ `fetchTournamentStats` - Fetch tournament stats
- ✅ `fetchPlayerStats` - Fetch player stats
- ✅ `fetchReceivedInvitations` - Fetch invitations
- ✅ `respondToInvitation` - Accept/decline invitation
- ✅ `capturePayment` - Capture payment

**State Structure:**
```javascript
{
  user: {
    profile: { /* user profile data */ },
    cricketProfile: { /* cricket profile data */ },
    stats: { /* overall stats */ },
    tournamentStats: { 1: {}, 2: {} }, // keyed by tourId
    playerStats: { "1_25": {} }, // keyed by tourId_playerId
    invitations: [ /* array of invitations */ ],
    inviteDetails: { /* current invite */ },
    paymentResult: { /* payment result */ },
    loading: {
      profile: false,
      cricketProfile: false,
      stats: false,
      invitations: false,
      payment: false,
    },
    error: null,
  }
}
```

## 🚀 Usage Examples

### Using Service Layer

```javascript
import { userService } from '../services';

// Get user profile
const profile = await userService.getUserProfile();
console.log('Profile:', profile);

// Update user profile
await userService.updateUserProfile({
  id: 1,
  firstname: 'John',
  lastname: 'Doe',
  email: 'john@example.com',
});

// Get cricket profile
const cricProfile = await userService.getCricketProfile();

// Update cricket profile
await userService.updateCricketProfile({
  userId: 1,
  cricketRole: 'ALL_ROUNDER',
  battingStyle: 'RIGHT_HAND_BAT',
  bowlingStyle: 'RIGHT_ARM_MEDIUM',
  tshirtNo: '7',
});

// Get tournament stats
const stats = await userService.getTournamentStats(5);

// Get invitations
const invitations = await userService.getReceivedInvitations();

// Accept invitation
await userService.respondToInvitation(5, 10, 'ACCEPTED');

// Decline invitation
await userService.respondToInvitation(5, 11, 'DECLINED');

// Capture payment
await userService.capturePayment({
  razorpay_order_id: 'order_...',
  razorpay_payment_id: 'pay_...',
  razorpay_signature: '...',
  payment_id: 'pay_...',
  order_id: 'order_...',
});
```

### Using Redux (Recommended)

```javascript
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserProfile,
  updateUserProfile,
  fetchCricketProfile,
  fetchUserStats,
  fetchReceivedInvitations,
  respondToInvitation,
} from '../store/slices/userSlice';

const UserProfileScreen = () => {
  const dispatch = useDispatch();
  const { profile, cricketProfile, loading, error } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    // Fetch data on mount
    dispatch(fetchUserProfile());
    dispatch(fetchCricketProfile());
    dispatch(fetchUserStats());
  }, [dispatch]);

  const handleUpdateProfile = async () => {
    try {
      await dispatch(updateUserProfile({
        id: profile.id,
        firstname: 'Updated Name',
        lastname: profile.lastname,
      })).unwrap();
      
      alert('Profile updated!');
    } catch (error) {
      alert('Error: ' + error);
    }
  };

  if (loading.profile) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View>
      <Text>Name: {profile?.firstname} {profile?.lastname}</Text>
      <Text>Email: {profile?.email}</Text>
      <Text>Cricket Role: {cricketProfile?.cricketRole}</Text>
      <Button title="Update" onPress={handleUpdateProfile} />
    </View>
  );
};
```

### Invitations Example

```javascript
const InvitationsScreen = () => {
  const dispatch = useDispatch();
  const { invitations, loading } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchReceivedInvitations());
  }, [dispatch]);

  const handleAccept = async (invitation) => {
    try {
      await dispatch(respondToInvitation({
        tourId: invitation.tourId,
        inviteId: invitation.id,
        status: 'ACCEPTED',
      })).unwrap();
      
      alert('Invitation accepted!');
    } catch (error) {
      alert('Error: ' + error);
    }
  };

  return (
    <FlatList
      data={invitations}
      renderItem={({ item }) => (
        <View>
          <Text>{item.tourName} - {item.team?.teamName}</Text>
          <Text>Role: {item.role}</Text>
          {item.inviteStatus === 'PENDING' && (
            <Button title="Accept" onPress={() => handleAccept(item)} />
          )}
        </View>
      )}
    />
  );
};
```

### Stats Example

```javascript
const StatsScreen = ({ tournamentId }) => {
  const dispatch = useDispatch();
  const { stats, tournamentStats, loading } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUserStats());
    if (tournamentId) {
      dispatch(fetchTournamentStats(tournamentId));
    }
  }, [dispatch, tournamentId]);

  const tourStats = tournamentStats[tournamentId];

  return (
    <View>
      <Text>Overall Stats</Text>
      <Text>Matches: {stats?.matches || 0}</Text>
      <Text>Runs: {stats?.runs || 0}</Text>
      
      {tourStats && (
        <>
          <Text>Tournament Stats</Text>
          <Text>Runs: {tourStats.runs || 0}</Text>
          <Text>Wickets: {tourStats.wickets || 0}</Text>
        </>
      )}
    </View>
  );
};
```

## 📋 API Request/Response Examples

### Get User Profile

**Request:**
```http
GET /v1/user/profile
```

**Response:**
```json
{
  "timeStamp": "2026-02-22T10:28:10.912Z",
  "status": "string",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "phone": "1234567890",
    "firstname": "John",
    "lastname": "Doe",
    "username": "johndoe",
    "dob": "1990-01-01T00:00:00.000Z",
    "profileImg": "https://...",
    "status": "ACTIVE",
    "gender": "MALE",
    "orgId": 1,
    "roles": "USER"
  }
}
```

### Update Cricket Profile

**Request:**
```http
PUT /v1/user/cric-profile
Content-Type: application/json

{
  "userId": 1,
  "cricketRole": "ALL_ROUNDER",
  "battingStyle": "RIGHT_HAND_BAT",
  "bowlingStyle": "RIGHT_ARM_MEDIUM",
  "tshirtNo": "7"
}
```

**Response:**
```json
{
  "timeStamp": "2026-02-22T10:52:42.694Z",
  "status": "string",
  "data": {
    "userId": 1,
    "id": 1,
    "cricketRole": "ALL_ROUNDER",
    "battingStyle": "RIGHT_HAND_BAT",
    "bowlingStyle": "RIGHT_ARM_MEDIUM",
    "tshirtNo": "7"
  }
}
```

### Accept Invitation

**Request:**
```http
PUT /v1/user/tour/5/invite/10/accept/ACCEPTED
```

**Response:**
```json
{
  "timeStamp": "2026-02-22T10:49:24.719Z",
  "status": "string",
  "data": {
    "userId": 1,
    "inviteStatus": 0
  }
}
```

## 🎯 Next Steps

### Create UI Screens:

1. **UserProfileScreen** - View and edit user profile
2. **CricketProfileScreen** - Edit cricket-specific settings
3. **UserStatsScreen** - Display stats and achievements
4. **InvitationsScreen** - Manage team/tournament invitations
5. **PaymentScreen** - Handle payment processing

### Add Navigation:

```javascript
// In your navigator
<Stack.Screen name="UserProfile" component={UserProfileScreen} />
<Stack.Screen name="CricketProfile" component={CricketProfileScreen} />
<Stack.Screen name="UserStats" component={UserStatsScreen} />
<Stack.Screen name="Invitations" component={InvitationsScreen} />
```

## 🔧 Features

- ✅ **Smart Caching** - Profiles cached for offline access
- ✅ **Background Refresh** - Auto-updates cached data
- ✅ **Error Handling** - Falls back to cache on errors
- ✅ **Loading States** - Individual loading states for each operation
- ✅ **Redux Integration** - Full Redux Toolkit support
- ✅ **Type Safety** - Clear method signatures
- ✅ **Cache Management** - Manual cache control methods

## 📝 Cache Management

```javascript
// Force refresh (skip cache)
await userService.getUserProfile(true);

// Get cached data (no API call)
const cached = await userService.getCachedProfile();

// Clear all user cache
await userService.clearCache();
```

## 🔐 Authentication

All user APIs require authentication. The auth token is automatically added to requests by the API interceptor.

## 📚 Complete API List

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/user/profile` | GET | Get user profile |
| `/v1/user/profile` | PUT | Update user profile |
| `/v1/user/cric-profile` | GET | Get cricket profile |
| `/v1/user/cric-profile` | PUT | Update cricket profile |
| `/v1/user/stats` | GET | Get overall stats |
| `/v1/user/tour/{tourId}/stats` | GET | Get tournament stats |
| `/v1/user/tour/{tourId}/player/{playerId}/stats` | GET | Get player stats |
| `/v1/user/invite-details` | GET | Get invite details |
| `/v1/user/invitations/received` | GET | Get received invitations |
| `/v1/user/tour/{tid}/invite/{inviteid}/accept/{status}` | PUT | Accept/decline invitation |
| `/v1/user/payment/capture` | POST | Capture payment |

## ✅ Summary

All User Controller APIs are now fully integrated and ready to use:

- ✅ 11 API endpoints configured
- ✅ Service layer with caching
- ✅ Redux state management
- ✅ Complete error handling
- ✅ Loading states
- ✅ Cache management
- ✅ Payment integration ready

Start building your user interface screens using the examples above!
