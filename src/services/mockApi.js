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
          name: 'Test Tournament 2026',
          start_date: '2026-01-01',
          end_date: '2026-12-31',
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
          tournament_id: tournamentId,
          team1: 'Team A',
          team2: 'Team B',
          match_date: '2026-02-20',
          status: 'FIXTURE',
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
