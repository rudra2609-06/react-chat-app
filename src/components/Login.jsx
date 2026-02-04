import React, { useState } from "react";
import { toast } from "react-toastify";

function Login() {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  function handleAvatar(e) {
    console.log(e);
    setAvatar({
      file: e.target.files[0],
      url: URL.createObjectURL(e.target.files[0]),
    });
  }

  function handleLogin(e){
	e.preventDefault();
	toast.success("LoggedIn successfully");
  }

  return (
    <div className="login w-full h-full overflow-hidden flex items-center gap-25">
      <div className="item flex-1 flex flex-col items-center gap-5">
        <h2>Welcome back,</h2>
        <form
		  onSubmit={handleLogin}
          method="post"
          className="flex flex-col items-center justify-center gap-5"
        >
          <input
            type="email"
            name="email"
            id="loginEmail"
            placeholder="Email..."
            className="p-5 border-0 outline-0 bg-theme rounded-sm"
          />
          <input
            type="password"
            name="password"
            id="loginPassword"
            placeholder="Password..."
            className="p-5 border-0 outline-0 bg-theme rounded-sm"
          />
          <button
            type="submit"
            className="cursor-pointer w-full p-5 border-0 bg-[#1f8ef1] text-white rounded-sm font-medium"
          >
            Sign In
          </button>
        </form>
      </div>
      <div className="seperator h-[80%] w-0.5 bg-[#dddddd35]"></div>
      <div className="item flex-1 flex flex-col items-center gap-5">
        <h2>Create Account</h2>
        <form
          method="post"
          className="flex flex-col items-center justify-center gap-3"
        >
          <label
            htmlFor="file"
            className="w-full flex items-center justify-between cursor-pointer underline"
          >
            <img
              src={avatar.url || "./avatar.png"}
              alt=""
              className="w-12.5 h-12.5 rounded-xl object-cover opacity-60"
            />
            Upload an image
          </label>
          <input
            type="file"
            name="uploadedFile"
            id="file"
            className="hidden"
            onChange={handleAvatar}
          />
          <input
            type="text"
            name="username"
            id="username"
            placeholder="username..."
            className="p-5 border-0 outline-0 bg-theme rounded-sm"
          />
          <input
            type="email"
            name="email"
            id="signUpEmail"
            placeholder="Email..."
            className="p-5 border-0 outline-0 bg-theme rounded-sm"
          />
          <input
            type="password"
            name="password"
            id="signUpPassword"
            placeholder="Password..."
            className="p-5 border-0 outline-0 bg-theme rounded-sm"
          />
          <button
            type="submit"
            className="cursor-pointer w-full p-5 border-0 bg-[#1f8ef1] text-white rounded-sm font-medium"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
