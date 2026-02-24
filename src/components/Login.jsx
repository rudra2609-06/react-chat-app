import React, { useState } from "react";
import { toast } from "react-toastify";
import { account, db, storage } from "../appwrite/config";
import { ID } from "appwrite";
import { useDispatch } from "react-redux";
import { fetchUserData } from "../features/userSlice";

function Login() {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });
  const [isSubmitting, setIsSubmitting] = useState({
    signUp: false,
    login: false,
  });
  const dispatch = useDispatch();

  function handleAvatar(e) {
    setAvatar({
      file: e.target.files[0],
      url: URL.createObjectURL(e.target.files[0]),
    });
  }

  async function handleLogin(e) {
    e.preventDefault();
    const data = new FormData(e.target);
    const { email, password } = Object.fromEntries(data);
    try {
      setIsSubmitting((prev) => ({
        ...prev,
        login: true,
      }));
      await account.createEmailPasswordSession({
        email,
        password,
      });
      await dispatch(fetchUserData());
      e.target.reset();
      toast.success("LoggedIn successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting((prev) => ({
        ...prev,
        login: false,
      }));
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    const data = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(data);
    console.log(username);

    try {
      setIsSubmitting((prev) => ({
        ...prev,
        signUp: true,
      }));

      // delete already existing session i.e. if user has acc and it create new with same cred
      try {
        await account.deleteSession("current");
      } catch (error) {
        console.log(error.message);
      }

      // register user in appwrite
      const user = await account.create(ID.unique(), email, password);

      //auto login after registration
      await account.createEmailPasswordSession(email, password);

      //handle avatar upload
      let avatarURL = "";
      if (avatar.file) {
        try {
          const uploadedFile = await storage.createFile(
            import.meta.env.VITE_APPWRITE_BUCKET_ID,
            ID.unique(),
            avatar.file,
          );
          avatarURL = storage.getFileView(
            import.meta.env.VITE_APPWRITE_BUCKET_ID,
            uploadedFile.$id,
          );
        } catch (error) {
          toast.error("Could not upload avatar" + error.message);
        }
      }

      // create entry in db
      await db.createDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
        user.$id,
        {
          username: username,
          Email: email,
          blocked: [],
          userID: user.$id,
          avatar: avatarURL,
        },
      );

      await db.createDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERCHAT_TABLE_ID,
        user.$id,
        {
          chats: [],
        },
      );

      dispatch(fetchUserData());
      e.target.reset();
      toast.success(`Welcome ${username} on board`);
    } catch (error) {
      toast.warn(error.message);
    } finally {
      setIsSubmitting((prev) => ({
        ...prev,
        signUp: false,
      }));
      setAvatar({
        avatar: null,
        url: "",
      });
    }
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
            // disabled={isSubmitting.login}
            type="submit"
            className="cursor-pointer w-full p-5 border-0 bg-[#1f8ef1] text-white rounded-sm font-medium"
          >
            {isSubmitting.login ? (
              <div className="flex items-center gap-1.5 justify-center">
                <span className={`spinner`}></span>
                <span>LoggingIn</span>
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
      <div className="seperator h-[80%] w-0.5 bg-[#dddddd35]"></div>
      <div className="item flex-1 flex flex-col items-center gap-5">
        <h2>Create Account</h2>
        <form
          onSubmit={handleRegister}
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
            accept="image/*"
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
            disabled={isSubmitting.signUp}
          >
            {isSubmitting.signUp ? (
              <div className="flex items-center gap-1.5 justify-center">
                <span className={`spinner`}></span>
                <span>Submitting</span>
              </div>
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
