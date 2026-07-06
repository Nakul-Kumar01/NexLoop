

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from '../utils/axiosClient'

export const fetchProfile = createAsyncThunk( 
  'user/MyProfile', 
  async (_, { rejectWithValue }) => {
    try {
    const response =  await axiosClient.get('/user/myprofile');
    console.log("here",response.data);
    return response.data; // goes into payload
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);


const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    user: null,
    loading: false,
    error: null
  },
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      // Register User Cases
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.response.data || 'Something went wrong';
        state.user = null;
      })
  
  }
});

export default profileSlice.reducer;