import React from "react";

function AddUser() {
  return (
    <div className="addUser p-7.5 bg-theme-dark rounded-xl absolute inset-0 m-auto w-max h-max">
      <form action="" className="flex gap-5">
        <input
          type="text"
          name="username"
          id="username"
          placeholder="Username..."
          className="p-5 rounded-xl outline-0 border-0 bg-white placeholder:text-black text-black"
        /> 
        <button
          type="button"
          className="p-5 bg-[#1a73e8] rounded-xl text-white border-0 cursor-pointer"
        >
          Search
        </button>
      </form>
      <div className="user mt-12.5 flex items-center justify-between">
        <div className="detail flex items-center gap-5">
          <img
            src="./avatar.png"
            alt="userAvatar"
            className="w-12.5 h-12.5 rounded-full object-cover"
          />
          <span>Jan Doe</span>
        </div>
        <button
          type="button"
          className="cursor-pointer p-2.5 bg-[#1a73e8] rounded-xl text-white border-0"
        >
          Add User
        </button>
      </div>
    </div>
  );
}

export default AddUser;
