import React from "react";
import List from "./components/List";
import Chat from "./components/Chat";
import Details from "./components/Details";
import Login from "./components/Login";
import Notification from "./components/Notification";

function App() {
  const user = true;
  return (
    <>
      <div className="container">
        {!user ? (
          <Login />
        ) : (
          <>
            <List />
            <Chat />
            <Details />
          </>
        )}
      </div>
      <Notification />
    </>
  );
}

export default App;
