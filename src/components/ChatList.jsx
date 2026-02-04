import React, { useState } from "react";
import AddUser from "./AddUser";

function ChatList() {
  const [isClicked, setIsClicked] = useState(false);

  return (
    <div className="chatList">
      <div className="search flex items-center gap-5">
        <div className="searchBar flex items-center rounded-xl flex-1 bg-theme h-10">
          <input
            type="text"
            name="search"
            id="search"
            placeholder="Search..."
            className="outline-0 border-0 text-white placeholder:text-left pl-4 flex flex-1"
          />
        </div>
        <button
          onClick={() => setIsClicked((prev) => !prev)}
          type="button"
          className="p-2 bg-theme hover:bg-opacity-80 cursor-pointer rounded-lg transition-all duration-200 active:scale-95 hover:scale-105"
        >
          <img
            src={!isClicked ? "./plus.png" : "./minus.png"}
            alt="plus"
            className="w-5 h-5"
          />
        </button>
      </div>
      <div className="item flex items-center gap-5 p-5 cursor-pointer  border-b-2 border-b-[#dddddd35]">
        <img
          src="./avatar.png"
          alt="userAvatar"
          className="w-12.5 h-12.5 rounded-full object-cover"
        />
        <div className="text flex flex-col gap-2.5">
          <span className="font-medium">User Name</span>
          <p className="text-sm font-light">Hello, World</p>
        </div>
      </div>
      {isClicked && <AddUser />}
    </div>
  );
}

export default ChatList;
