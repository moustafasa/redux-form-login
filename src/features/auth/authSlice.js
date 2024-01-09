import { createSlice } from "@reduxjs/toolkit";

const initialState = { user: null, token: null };

const authSlice = createSlice({
  initialState,
  name: "auth",
  reducers: {
    setCredentials(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
    },
    logOut(state, action) {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;
export const getCurrentUser = (state) => state.auth.user;
export const getCurrentToken = (state) => state.auth.token;

export default authSlice.reducer;
