import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

const initialState = {
  notifications: [],
  unreadCount: 0,
};

// Fetch notifications from the server
export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (token) => {
    const { data } = await api.get("/api/notification", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.success ? data : { notifications: [], unreadCount: 0 };
  },
);

// Mark all as read
export const markAllRead = createAsyncThunk(
  "notifications/markAllRead",
  async (token) => {
    await api.post(
      "/api/notification/read-all",
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Add a real-time notification from SSE
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    // Mark a single notification as read (local)
    markOneRead: (state, action) => {
      const notif = state.notifications.find((n) => n._id === action.payload);
      if (notif && !notif.is_read) {
        notif.is_read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    // Reset to 0 after marking all as read
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
      state.notifications.forEach((n) => {
        n.is_read = true;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.unreadCount = 0;
        state.notifications.forEach((n) => {
          n.is_read = true;
        });
      });
  },
});

export const { addNotification, markOneRead, resetUnreadCount } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
