import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { account, db } from "../appwrite/config";

export const fetchUserData = createAsyncThunk(
  "userSlice/fetchUserData",
  async (_, { rejectWithValue }) => {
    try {
      const authData = await account.get();
      const dbData = await db.getDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
        authData.$id, 
      );
      return dbData;
    } catch (error) {
      return rejectWithValue(error.message || "Could to fetech userdata");
    }
  },
);

export const userSlice = createSlice({
  name: "userData",
  initialState: {
    isAuthenticated: false,
    userData: null,
    isLoading: false,
  },
  reducers: {
    clearData: (state) => {
      state.isLoading = false;
      state.userData = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: function (builder) {
    builder.addCase(fetchUserData.fulfilled, (state, action) => {
      state.isLoading = !state.isLoading;
      state.userData = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(fetchUserData.rejected, (state) => {
      state.isLoading = !state.isLoading;
    });
    builder.addCase(fetchUserData.pending, (state) => {
      state.isLoading = !state.isLoading;
    });
  },
});

export const { clearData } = userSlice.actions;
export default userSlice.reducer;
