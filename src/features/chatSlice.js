import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { account, db } from "../appwrite/config";

export const blockUser = createAsyncThunk(
  "chatSlice/blockUser",
  async (receiverId, { rejectWithValue }) => {
    try {
      const user = await account.get();
      const currentUserDoc = await db.getDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
        user.$id,
      );
      console.log(receiverId);

      const existingBlocked = currentUserDoc.blocked || [];
      // console.log(existingBlocked);

      if (existingBlocked.includes(receiverId)) return receiverId;

      await db.updateDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
        user.$id,
        {
          blocked: [...existingBlocked, receiverId],
        },
      );
      return receiverId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const unblockUser = createAsyncThunk(
  "chatSlice/unblockUser",
  async (receiverId, { rejectWithValue }) => {
    if (!receiverId) return;
    try {
      const user = await account.get();
      const existingUserDoc = await db.getDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
        user.$id,
      );
      const existingBlocked = existingUserDoc.blocked || [];

      //if it does not include id which means it is already not present in array
      if (!existingBlocked.includes(receiverId)) return receiverId;

      const updatedBlocked = existingBlocked.filter((id) => id !== receiverId);

      await db.updateDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
        user.$id,
        {
          blocked: updatedBlocked,
        },
      );
      return receiverId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const chatSlice = createSlice({
  name: "chatSlice",
  initialState: {
    userStats: {
      receiverUser: null,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
      chatID: null,
    },
    viewDetails: {
      receiverSeen: false,
    },
  },
  reducers: {
    changeChat: (state, action) => {
      const { chatID, receiverUser, currentUser } = action.payload;

      if (!receiverUser || !currentUser || !chatID) return;

      state.userStats.chatID = chatID;
      state.userStats.receiverUser = receiverUser;

      // Did current user block receiver
      state.userStats.isReceiverBlocked = currentUser.blocked.includes(
        receiverUser.$id,
      );

      // Did receiver block current user
      state.userStats.isCurrentUserBlocked = receiverUser.blocked.includes(
        currentUser.$id,
      );
    },
    changeSeen: (state) => {
      state.viewDetails.receiverSeen = true;
    },
  },
  extraReducers: (builder) => {
    //case to block user
    builder
      .addCase(blockUser.fulfilled, (state, action) => {
        if (action.payload) {
          state.userStats.isReceiverBlocked = true;
        }
      })
      .addCase(blockUser.rejected, (_, action) => {
        console.log("failed to block user with id: ", action.payload);
      });

    //case to unblock the user
    builder
      .addCase(unblockUser.fulfilled, (state, action) => {
        if (action.payload) {
          console.log("reached");
          state.userStats.isReceiverBlocked = false;
          console.log(state.userStats.isReceiverBlocked);
        }
      })
      .addCase(unblockUser.rejected, (_, action) => {
        console.log("Failed to unblock the user with id: ", action.payload);
      });
  },
});

export const { changeChat, changeSeen } = chatSlice.actions;
export default chatSlice.reducer;
