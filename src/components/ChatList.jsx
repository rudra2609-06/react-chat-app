import React, { useEffect, useState } from "react";
import AddUser from "./AddUser";
import { account, appwriteClient, db } from "../appwrite/config";
import { useDispatch, useSelector } from "react-redux";
import { changeChat, changeSeen } from "../features/chatSlice";

function ChatList() {
  const [isClicked, setIsClicked] = useState(false);
  const [chats, setChats] = useState([]);
  const [filteredRecords, setFilterRecords] = useState("");

  const { isCurrentUserBlocked, receiverUser } = useSelector(
    (state) => state.chat.userStats,
  );

  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const authData = await account.get();

        const userChats = await db.getDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERCHAT_TABLE_ID,
          authData.$id,
        );

        const chatList = (userChats.chats || []).map((chat) =>
          JSON.parse(chat),
        );

        const promises = chatList.map(async (chat) => {
          try {
            const otherUserData = await db.getDocument(
              import.meta.env.VITE_APPWRITE_DATABASE_ID,
              import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
              chat.receiverId,
            );
            return { ...chat, user: otherUserData };
          } catch (error) {
            console.log(error.message);
          }
        });
        const chatsWithUserData = await Promise.all(promises);
        setChats(chatsWithUserData);
      } catch (err) {
        console.log(err);
      }
    };
    fetchChats();

    const unsub = appwriteClient.subscribe(
      `databases.${import.meta.env.VITE_APPWRITE_DATABASE_ID}.collections.${import.meta.env.VITE_APPWRITE_USERCHAT_TABLE_ID}.documents`,
      async (res) => {
        if (res.events.some((event) => event.includes(".update"))) {
          const updatedChats = (res.payload.chats || []).map((chat) =>
            JSON.parse(chat),
          );
          const promises = updatedChats?.map(async (chat) => {
            try {
              const otherUserData = await db.getDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
                chat.receiverId,
              );
              return { ...chat, user: otherUserData };
            } catch (chat) {
              return chat;
            }
          });
          const chatsWithUserData = await Promise.all(promises);
          setChats(chatsWithUserData);
        }
      },
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    setFilterRecords(chats);
  }, [chats]);
  console.log(filteredRecords);

  async function handleChangeChat(chatDetails) {
    try {
      const receiverChatDoc = await db.getDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERCHAT_TABLE_ID,
        userData.$id,
      );

      const parsedReceiverChats = receiverChatDoc.chats.map((c) =>
        JSON.parse(c),
      );


      const updatedReceiverChats = parsedReceiverChats.map((chat) =>
        chat.chatId === chatDetails.chatId ? { ...chat, isSeen: true } : chat,
      );

      await db.updateDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERCHAT_TABLE_ID,
        userData.$id,
        { chats: updatedReceiverChats.map((c) => JSON.stringify(c)) },
      );
    } catch (error) {
      console.log(error.message);
    }

    const dispatchPayload = {
      chatID: chatDetails.chatId,
      receiverUser: chatDetails.user,
      currentUser: userData,
    };
    dispatch(changeChat(dispatchPayload));
  }

  function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    if (!query) {
      setFilterRecords(chats);
      return;
    }
    const res = chats?.filter((chat) =>
      chat.user.username.toLowerCase().includes(query),
    );
    if (!res) return;
    setFilterRecords(res);
  }

  return (
    <div
      tabIndex={0}
      className="chatList"
      onKeyDown={(e) => (e.key === "Escape" ? setIsClicked(false) : null)}
    >
      <div className="search flex items-center gap-5">
        <div className="searchBar flex items-center rounded-xl flex-1 bg-theme h-10">
          <input
            type="search"
            name="search"
            id="search"
            onChange={handleSearch}
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
            src={!isClicked ? "/plus.png" : "/minus.png"}
            alt="plus"
            className="w-5 h-5"
          />
        </button>
      </div>
      {filteredRecords.length > 0 ? (
        filteredRecords?.map((chat) => {
          return (
            <div
              className="item flex items-center gap-5 p-5 cursor-pointer  border-b-2 border-b-[#dddddd35]"
              tabIndex={0}
              onClick={() => handleChangeChat(chat)}
              key={chat.chatId}
            >
              <img
                src={
                  !isCurrentUserBlocked
                    ? chat.user?.avatar || "/avatar.png"
                    : "/blocked.png"
                }
                alt="userAvatar"
                className="w-12.5 h-12.5 rounded-full object-cover"
              />
              <div className="text flex flex-col gap-2.5">
                <span className="font-medium">
                  {chat.user?.username || "User Name"}
                </span>
                <p className="text-sm font-light">
                  {chat?.lastMessage || "Start Conversation"}
                </p>
              </div>
            </div>
          );
        })
      ) : (
        <span className="block mt-5 text-center text-red-500">
          No chat found
        </span>
      )}
      {isClicked && <AddUser />}
    </div>
  );
}

export default ChatList;
