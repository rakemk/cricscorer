// Mock API Service - For testing without backend server
// This provides fake data for development/testing

const MOCK_DELAY = 500; // Simulate network delay

// Mock user database
const MOCK_USERS = {
  '333': {
    username: '333',
    password: '1234',
    access_token: 'mock_access_token_123',
    refresh_token: 'mock_refresh_token_456',
    token_type: 'Bearer',
    user: {
      id: 1,
      username: '333',
      name: 'Test User',
      email: 'test@example.com',
    },
  },
  '7798267704': {
    username: '7798267704',
    password: 'Rahul@123',
    access_token: 'mock_access_token_789',
    refresh_token: 'mock_refresh_token_012',
    token_type: 'Bearer',
    user: {
      id: 2,
      username: '7798267704',
      name: 'Rahul',
      email: 'rahul@example.com',
    },
  },
};

// Helper to simulate async delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApiService = {
  /**
   * Mock login endpoint
   */
  async login(username, password) {
    await delay(MOCK_DELAY);

    console.log('🔶 Mock API: Login attempt', { username });

    const user = MOCK_USERS[username];

    if (!user || user.password !== password) {
      throw {
        message: 'Invalid Email or Password',
        status: 401,
      };
    }

    console.log('✅ Mock API: Login successful');

    return {
      data: {
        access_token: user.access_token,
        refresh_token: user.refresh_token,
        token_type: user.token_type,
        user: user.user,
      },
    };
  },

  /**
   * Mock tournament list
   */
  async getTournaments() {
    await delay(MOCK_DELAY);

    return {
      data: [
        {
          id: 1,
          tour_id: 1,
          name: 'IPL 2026',
          tournament_name: 'Indian Premier League 2026',
          start_date: '2026-03-01',
          end_date: '2026-05-31',
          status: 'ACTIVE',
        },
        {
          id: 2,
          tour_id: 2,
          name: 'Test Series 2026',
          tournament_name: 'International Test Series 2026',
          start_date: '2026-06-01',
          end_date: '2026-08-31',
          status: 'UPCOMING',
        },
      ],
    };
  },

  /**
   * Mock fixture list
   */
  async getFixtures(tournamentId) {
    await delay(MOCK_DELAY);

    return {
      data: [
        {
          id: 1,
          match_id: 1,
          tournament_id: tournamentId,
          team1_id: 1,
          team1_name: 'Mumbai Indians',
          team1_short_name: 'MI',
          team1_logo: null,
          team2_id: 2,
          team2_name: 'Chennai Super Kings',
          team2_short_name: 'CSK',
          team2_logo: null,
          match_date: '2026-02-20',
          match_time: '19:30:00',
          match_status: 'FIXTURE',
          match_type: 'T20',
          match_no: '1',
          ground_name: 'Wankhede Stadium',
          venue: 'Mumbai',
          tournament_name: 'Test Tournament 2026',
        },
        {
          id: 2,
          match_id: 2,
          tournament_id: tournamentId,
          team1_id: 3,
          team1_name: 'Royal Challengers',
          team1_short_name: 'RCB',
          team1_logo: null,
          team2_id: 4,
          team2_name: 'Delhi Capitals',
          team2_short_name: 'DC',
          team2_logo: null,
          match_date: '2026-02-21',
          match_time: '15:30:00',
          match_status: 'LIVE',
          match_type: 'T20',
          match_no: '2',
          ground_name: 'M. Chinnaswamy Stadium',
          venue: 'Bangalore',
          tournament_name: 'Test Tournament 2026',
        },
        {
          id: 3,
          match_id: 3,
          tournament_id: tournamentId,
          team1_id: 5,
          team1_name: 'Kolkata Knight Riders',
          team1_short_name: 'KKR',
          team1_logo: null,
          team2_id: 6,
          team2_name: 'Punjab Kings',
          team2_short_name: 'PBKS',
          team2_logo: null,
          match_date: '2026-02-18',
          match_time: '14:00:00',
          match_status: 'COMPLETED',
          match_type: 'T20',
          match_no: '3',
          ground_name: 'Eden Gardens',
          venue: 'Kolkata',
          tournament_name: 'Test Tournament 2026',
        },
      ],
    };
  },

  /**
   * Generic mock GET request
   */
  async get(url) {
    await delay(MOCK_DELAY);
    console.log('🔶 Mock API GET:', url);

    if (url.includes('/tournament/list')) {
      return this.getTournaments();
    }

    if (url.includes('/fixture/list')) {
      return this.getFixtures(1);
    }

    return { data: [] };
  },

  /**
   * Generic mock POST request
   */
  async post(url, data) {
    await delay(MOCK_DELAY);
    console.log('🔶 Mock API POST:', url, data);

    if (url.includes('/auth/scorer')) {
      return this.login(data.username, data.password);
    }

    return { data: { success: true } };
  },

  /**
   * Generic mock PUT request
   */
  async put(url, data) {
    await delay(MOCK_DELAY);
    console.log('🔶 Mock API PUT:', url, data);
    return { data: { success: true } };
  },

  /**
   * Generic mock DELETE request
   */
  async delete(url) {
    await delay(MOCK_DELAY);
    console.log('🔶 Mock API DELETE:', url);
    return { data: { success: true } };
  },
};

export default mockApiService;
