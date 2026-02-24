import React, { useEffect, useState } from "react";
import { account, appwriteClient } from "../appwrite/config.js";
import { useDispatch, useSelector } from "react-redux";
import { clearData } from "../features/userSlice.js";
import { toast } from "react-toastify";
import { blockUser, changeChat, unblockUser } from "../features/chatSlice.js";

function Details() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const { receiverUser, isCurrentUserBlocked, isReceiverBlocked, chatID } =
    useSelector((state) => state.chat.userStats);
  const currentUser = useSelector((state) => state.user.userData);

  useEffect(() => {
    if (!receiverUser?.$id) return;
    const unsub = appwriteClient.subscribe(
      `databases.${import.meta.env.VITE_APPWRITE_DATABASE_ID}.collections.${import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID}.documents.${receiverUser.$id}`,
      (response) => {
        const updatedReceiver = response.payload;
        dispatch(
          changeChat({ chatID, receiverUser: updatedReceiver, currentUser }),
        );
      },
    );

    return () => unsub();
  }, [receiverUser?.$id, chatID, dispatch, currentUser]);

  async function handleLogout() {
    try {
      await account.deleteSession("current");
      dispatch(clearData());
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.message || "Unable to logout");
    }
  }

  function handleBlockUser(id) {
    if (!isReceiverBlocked) {
      console.log("block ran");
      dispatch(blockUser(id));
      toast.success(`User ${receiverUser.username} blocked successfully`);
    } else {
      // console.log("unblock ran");
      dispatch(unblockUser(id));
      toast.success(
        `We beleive in forgiving... ${receiverUser.username} is unblocked`,
      );
    }
  }


  return (
    <div className="details flex flex-col flex-1 h-full">
      <div className="user py-7.5 px-5 flex flex-col items-center gap-3.75 border-b border-b-[#dddddd35]">
        <img
          src={
            !isCurrentUserBlocked
              ? receiverUser.avatar || "/avatar.png"
              : "/blocked.png"
          }
          alt="userAvatar"
          className="w-25 h-25 object-cover rounded-full cursor-pointer"
        />
        <h2>{receiverUser.username || "Jan Doe"}</h2>
        <p className="text-center">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aut, ipsam.
        </p>
      </div>
      <div
        className={`info p-5 flex flex-1 flex-col overflow-hidden ${isOpen ? "gap-3" : "gap-5"}`}
      >
        <div className="option">
          <div className="title flex items-center justify-between">
            <span>Chat Settings</span>
            <img
              src="/arrowUp.png"
              alt="arrowUp"
              className="w-7.5 h-7.5 bg-theme p-2.5 rounded-full cursor-pointer"
            />
          </div>
        </div>

        <div className="option">
          <div className="title flex items-center justify-between">
            <span>Privacy & help</span>
            <img
              src="/arrowUp.png"
              alt="arrowUp"
              className="w-7.5 h-7.5 bg-theme p-2.5 rounded-full cursor-pointer"
            />
          </div>
        </div>

        <div className="option flex flex-col min-h-0">
          <div className="title flex items-center justify-between">
            <span>Shared photos</span>
            <img
              src="/arrowDown.png"
              alt="arrowUp"
              className="w-7.5 h-7.5 bg-theme p-2.5 rounded-full cursor-pointer"
              onClick={() => setIsOpen((prev) => !prev)}
            />
          </div>
          <div
            className={`photos  flex flex-col gap-5 overflow-auto flex-1 min-h-0 ${isOpen ? `mt-5` : ""}`}
          >
            {isOpen && (
              <>
                <div className="photoItem flex items-center justify-between">
                  <div className="photoDetail flex items-center gap-5">
                    <img
                      src=""
                      alt=""
                      className="w-10 h-10 rounded-sm object-cover"
                    />
                    <span className="text-sm text-stone-200 font-light">
                      photo_2024.png
                    </span>
                  </div>
                  <img
                    src="/download.png"
                    alt=""
                    className="w-7.5 h-7.5 bg-theme p-2.5 rounded-full cursor-pointer"
                  />
                </div>
                <div className="photoItem flex items-center justify-between">
                  <div className="photoDetail flex items-center gap-5">
                    <img
                      src=""
                      alt=""
                      className="w-10 h-10 rounded-sm object-cover"
                    />
                    <span className="text-sm text-stone-200 font-light">
                      photo_2024.png
                    </span>
                  </div>
                  <img
                    src="/download.png"
                    alt=""
                    className="w-7.5 h-7.5 bg-theme p-2.5 rounded-full cursor-pointer"
                  />
                </div>
                <div className="photoItem flex items-center justify-between">
                  <div className="photoDetail flex items-center gap-5">
                    <img
                      src=""
                      alt=""
                      className="w-10 h-10 rounded-sm object-cover"
                    />
                    <span className="text-sm text-stone-200 font-light">
                      photo_2024.png
                    </span>
                  </div>
                  <img
                    src="/download.png"
                    alt=""
                    className="w-7.5 h-7.5 bg-theme p-2.5 rounded-full cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="option">
          <div className="title flex items-center justify-between">
            <span>Shared Files</span>
            <img
              src="/arrowUp.png"
              alt="arrowUp"
              className="w-7.5 h-7.5 bg-theme p-2.5 rounded-full cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          {!isCurrentUserBlocked && (
            <button
              type="button"
              onClick={() => handleBlockUser(receiverUser.$id)}
              className="p-2.5 bg-[rgba(230,74,105,0.553)] text-white rounded-md hover:bg-[rgba(220,20,60,0.796)] transition-colors duration-300 cursor-pointer"
            >
              {isReceiverBlocked ? "Unblock User" : "Block User"}
            </button>
          )}
          {isCurrentUserBlocked && (
            <p className="text-center text-sm text-stone-400">
              {`You have been blocked by ${receiverUser.username}`}
            </p>
          )}

          <button
            type="button"
            className="logout p-2.5 bg-[#176dde] rounded-md cursor-pointer hover:bg-[#2777df] transition-colors duration-300"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Details;
