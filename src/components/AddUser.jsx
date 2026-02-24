import React, { useState } from "react";
import { account, db, tablesDB } from "../appwrite/config";
import { ID, Query } from "appwrite";
import { toast } from "react-toastify";

function AddUser() {
  const [user, setUser] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const query = formData.get("username");
    try {
      const res = await tablesDB.listRows({
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
        tableId: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
        queries: [Query.search("username", query)],
      });
      if (res.rows.length > 0) {
        setUser(res.rows[0]);
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  console.log(user);

  async function handleAdd() {
    try {
      const currentUser = account.get();

      // get existing user chats document
      const userChats = await db.getDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERCHAT_TABLE_ID,
        (await currentUser).$id,
      );

      const existingChats = userChats.chats || [];

      //get existing receiver chats
      const receiverChats = await db.getDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERCHAT_TABLE_ID,
        await user.$id,
      );

      const existingReceiverChats = receiverChats.chats || [];

      const parsedChats = existingChats.map((chats) => JSON.parse(chats));
      const ifExist = parsedChats?.find((chat) => chat.receiverId === user.$id);

      if (user.$id === (await currentUser).$id) {
        toast.error("Cannot Add Yourself");
        return;
      }

      if (ifExist) {
        toast.error(`User ${user.username} Already Exists`);
        return;
      }

      let chatId = ID.unique();

      //if not then add new user

      const newChat = JSON.stringify({
        chatId,
        receiverId: user.$id,
        lastMessage: "",
        isSeen: false,
      });

      const receiversNewChat = JSON.stringify({
        chatId,
        receiverId: (await currentUser).$id,
        lastMessage: "",
        isSeen: false,
      });

      await db.updateDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERCHAT_TABLE_ID,
        (await currentUser).$id,
        {
          chats: [...existingChats, newChat],
        },
      );

      await db.updateDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERCHAT_TABLE_ID,
        user.$id,
        {
          chats: [...existingReceiverChats, receiversNewChat],
        },
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <div className="addUser p-7.5 bg-theme-dark rounded-xl absolute inset-0 m-auto w-max h-max">
      <form className="flex gap-5" onSubmit={handleSearch}>
        <input
          type="text"
          name="username"
          id="username"
          placeholder="Username..."
          className="p-5 rounded-xl outline-0 border-0 bg-white placeholder:text-black text-black"
        />
        <button
          type="submit"
          className="p-5 bg-[#1a73e8] rounded-xl text-white border-0 cursor-pointer"
        >
          Search
        </button>
      </form>
      {user && (
        <div className="user mt-12.5 flex items-center justify-between">
          <div className="detail flex items-center gap-5">
            <img
              src={user.avatar || "/avatar.png"}
              alt="userAvatar"
              className="w-12.5 h-12.5 rounded-full object-cover"
            />
            <span>{user.username || "dummy doe"}</span>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="cursor-pointer p-2.5 bg-[#1a73e8] rounded-xl text-white border-0"
          >
            Add User
          </button>
        </div>
      )}
    </div>
  );
}

export default AddUser;
