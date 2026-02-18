import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Toast notifications
  toast: {
    visible: false,
    message: '',
    type: 'info', // 'success', 'error', 'warning', 'info'
  },
  
  // Loading overlay
  globalLoading: false,
  loadingMessage: '',
  
  // Network status
  isOnline: true,
  
  // Theme
  isDarkMode: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: (state, action) => {
      state.toast = {
        visible: true,
        message: action.payload.message,
        type: action.payload.type || 'info',
      };
    },
    hideToast: (state) => {
      state.toast.visible = false;
    },
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload.loading;
      state.loadingMessage = action.payload.message || '';
    },
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
    },
  },
});

export const {
  showToast,
  hideToast,
  setGlobalLoading,
  setOnlineStatus,
  toggleDarkMode,
  setDarkMode,
} = uiSlice.actions;

export default uiSlice.reducer;
