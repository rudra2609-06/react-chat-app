import React from "react";
import { useSelector } from "react-redux";

function UserInfo() {
  const {userData} = useSelector((state) => state.user);
  
  return (
    <div className="userInfo  flex items-center justify-between">
      <div className="user flex items-center gap-5">
        <img
          src={userData?.avatar || "/avatar.png"}
          alt="userAvatar"
          className="w-12.5 h-12.5 rounded-full object-cover cursor-pointer"
        />
        <h2>{userData?.username}</h2>
      </div>
      <div className="icons flex gap-5">
        <img src="/more.png" alt="more" className="w-5 h-5 cursor-pointer" />
        <img src="/video.png" alt="video" className="w-5 h-5 cursor-pointer" />
        <img src="/edit.png" alt="edit" className="w-5 h-5 cursor-pointer" />
      </div>
    </div>
  );
}

export default UserInfo;
