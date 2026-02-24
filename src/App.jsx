import React, { useEffect } from "react";
import List from "./components/List";
import Chat from "./components/Chat";
import Details from "./components/Details";
import Login from "./components/Login";
import Notification from "./components/Notification";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData } from "./features/userSlice";
import DefaultChat from "./components/DefaultChat.jsx";

function App() {
  const { isLoading, isAuthenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { chatID } = useSelector((state) => state.chat.userStats);

  useEffect(() => {
    dispatch(fetchUserData());
  }, [dispatch]);

  if (isLoading)
    return (
      <div className="p-12.5 text-4xl rounded-xl bg-[rgba(17,25,40,0.9)]">
        Loading...
      </div>
    );

  return (
    <>
      <div className="container">
        {!isAuthenticated ? (
          <Login />
        ) : (
          <>
            <List />
            {!chatID ? (
              <DefaultChat />
            ) : (
              <>
                <Chat />
                <Details />
              </>
            )}
          </>
        )}
      </div>
      <Notification />
    </>
  );
}

export default App;
