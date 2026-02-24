import { configureStore } from "@reduxjs/toolkit";
import UserReducer from "../features/userSlice.js";
import ChatReducer from "../features/chatSlice.js";

export const store = configureStore({
  reducer: {
    user: UserReducer,
    chat: ChatReducer,
  },
});
