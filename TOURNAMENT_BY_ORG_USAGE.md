# Tournament by Organization - Usage Guide

## Overview
This guide explains how to use the new `/api/v1/org/{orgId}/tour` endpoint to fetch tournaments filtered by organization.

## API Endpoint

```
GET /api/v1/org/{orgId}/tour
```

**Parameters:**
- `orgId` - Organization ID (required)

**Returns:** Array of tournaments belonging to the specified organization

---

## Quick Start

### Step 1: Get Organization ID

The organization ID typically comes from the logged-in user's profile. It should be available in the auth state after login:

```javascript
import { useSelector } from 'react-redux';

const { user } = useSelector((state) => state.auth);
const orgId = user?.orgId;
```

### Step 2: Fetch Tournaments

**Option A: Using Redux (Recommended)**

```javascript
import { useDispatch } from 'react-redux';
import { fetchTournamentsByOrg } from '../store/slices/fixtureSlice';

const dispatch = useDispatch();

// Fetch tournaments for the user's organization
useEffect(() => {
  if (user?.orgId) {
    dispatch(fetchTournamentsByOrg(user.orgId));
  }
}, [user?.orgId]);
```

**Option B: Direct Service Call**

```javascript
import { tournamentService } from '../services';

const loadTournaments = async () => {
  try {
    const tournaments = await tournamentService.getTournamentsByOrg(orgId);
    console.log('Tournaments:', tournaments);
  } catch (error) {
    console.error('Failed to load tournaments:', error);
  }
};
```

---

## Complete Example - FixturesScreen

Here's a complete example showing how to modify FixturesScreen to use organization-specific tournaments:

```javascript
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTournamentsByOrg } from '../store/slices/fixtureSlice';

const FixturesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  
  // Get user info from auth state
  const { user } = useSelector((state) => state.auth);
  
  // Get tournaments from fixture state
  const { tournaments, loading, error } = useSelector((state) => state.fixture);

  useEffect(() => {
    // Fetch tournaments for user's organization
    if (user?.orgId) {
      console.log('Fetching tournaments for orgId:', user.orgId);
      dispatch(fetchTournamentsByOrg(user.orgId));
    } else {
      console.warn('No orgId found for user');
      // Fallback: fetch all tournaments
      // dispatch(fetchTournaments());
    }
  }, [user?.orgId, dispatch]);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View>
      <Text>Tournaments: {tournaments.length}</Text>
      <FlatList
        data={tournaments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item.tourName}</Text>
            <Text>{item.tourShortName}</Text>
            <Text>Teams: {item.noOfTeam}</Text>
          </View>
        )}
      />
    </View>
  );
};
```

---

## Response Structure

Each tournament object contains:

```javascript
{
  id: 1,                              // Tournament ID
  orgId: 123,                         // Organization ID
  userId: 45,                         // Creator user ID
  organizerName: "Pro Cricket League", // Organization name
  tourName: "IPL 2026",               // Full tournament name
  tourShortName: "IPL26",             // Short name
  logo: "https://.../logo.png",       // Logo URL
  tourImage: "https://.../image.png", // Tournament image
  status: "ACTIVE",                   // Status: ACTIVE, COMPLETED, etc.
  
  // Tournament type
  tourType: "GROUP",                  // GROUP, KNOCKOUT, etc.
  sportType: "cricket",               // Sport type
  overType: "LIMITED",                // LIMITED, T20, etc.
  bowlType: "TENNIS",                 // TENNIS, LEATHER, etc.
  
  // Dates
  tourStartAt: "2026-03-01T00:00:00.000Z",
  tourEndAt: "2026-05-31T00:00:00.000Z",
  registrationStartAt: "2026-01-15T00:00:00.000Z",
  registrationEndAt: "2026-01-31T00:00:00.000Z",
  auctionStartAt: "2026-02-01T00:00:00.000Z",
  auctionEndAt: "2026-02-10T00:00:00.000Z",
  
  // Settings
  noOfTeam: 10,                       // Number of teams
  noOfGroup: 4,                       // Number of groups
  groundName: "Wankhede Stadium",     // Venue
  location: "Mumbai, India",          // Location
  tourDescription: "Premier cricket tournament",
  
  // Participation settings
  playerParticipationType: "OPEN",    // OPEN, INVITED, etc.
  invityType: "INVITED",              // Invitation type
  
  // Publishing flags
  publish: "Y",                       // Is published
  fixturePublish: "Y",                // Are fixtures published
  deleted: "N"                        // Is deleted
}
```

---

## Caching

The service automatically caches results per organization:

```javascript
// Uses cache if available
const tournaments = await tournamentService.getTournamentsByOrg(orgId);

// Force refresh (skip cache)
const freshTournaments = await tournamentService.getTournamentsByOrg(orgId, true);
```

---

## Error Handling

```javascript
try {
  dispatch(fetchTournamentsByOrg(orgId))
    .unwrap()
    .then((tournaments) => {
      console.log('Success:', tournaments.length, 'tournaments');
    })
    .catch((error) => {
      console.error('Failed:', error);
      Alert.alert('Error', 'Failed to load tournaments');
    });
} catch (error) {
  console.error('Error:', error);
}
```

---

## Switching Between All Tournaments and Organization Tournaments

```javascript
const [useOrgFilter, setUseOrgFilter] = useState(false);

useEffect(() => {
  if (useOrgFilter && user?.orgId) {
    // Fetch organization-specific tournaments
    dispatch(fetchTournamentsByOrg(user.orgId));
  } else {
    // Fetch all tournaments
    dispatch(fetchTournaments());
  }
}, [useOrgFilter, user?.orgId, dispatch]);

// UI Toggle
<Switch
  value={useOrgFilter}
  onValueChange={setUseOrgFilter}
/>
<Text>Show only my organization's tournaments</Text>
```

---

## Troubleshooting

### No orgId Available
If `user.orgId` is undefined:
1. Check if the login response includes orgId in the user object
2. Verify the API returns orgId in the token/session data
3. Check authSlice to ensure user data is stored correctly

### 404 Error
- Verify the orgId is correct
- Check if the organization exists in the backend
- Ensure the API endpoint is `/api/v1/org/{orgId}/tour`

### Empty Array
- The organization may not have any tournaments yet
- Check the `deleted` and `status` fields in the database
- Verify the user has permission to view tournaments

---

## Related Endpoints

After fetching tournaments, you can fetch fixtures for each:

```javascript
// Get fixtures for a tournament
dispatch(fetchFixtures(tournamentId));
```

---

## Implementation Checklist

- [x] Add endpoint to `constants/config.js`
- [x] Add `getTournamentsByOrg()` to `tournamentService.js`
- [x] Add `fetchTournamentsByOrg` thunk to `fixtureSlice.js`
- [x] Add reducers for pending/fulfilled/rejected states
- [x] Import and use in FixturesScreen
- [ ] Get orgId from user state after login
- [ ] Test with real API
- [ ] Handle error cases
- [ ] Add UI toggle for org filter (optional)

---

## Support

For issues or questions:
1. Check console logs for detailed error messages
2. Verify the API endpoint exists in Swagger UI
3. Test the endpoint in Postman with a valid orgId
4. Check if the user's organization has tournaments in the database
