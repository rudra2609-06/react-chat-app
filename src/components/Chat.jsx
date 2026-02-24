import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useRef, useState } from "react";
import { appwriteClient, db } from "../appwrite/config";
import { useDispatch, useSelector } from "react-redux";
import { ID, Query } from "appwrite";
import { AnimatePresence } from "motion/react";
import { changeChat, changeSeen } from "../features/chatSlice";
import { CheckCheck } from "lucide-react";

function Chat() {
  const [isEmojiClicked, setIsEmojiClicked] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const { userData } = useSelector((state) => state.user);
  const { receiverUser, isCurrentUserBlocked, isReceiverBlocked, chatID } =
    useSelector((state) => state.chat.userStats);
  const currentUser = useSelector((state) => state.user.userData);
  const { receiverSeen } = useSelector((state) => state.chat.viewDetails);



  

  // console.log(receiverSeen);

  let isBlocked = isCurrentUserBlocked || isReceiverBlocked;
  const dispatch = useDispatch();

  function handleEmoji(e) {
    setText((prev) => prev + e.emoji);
    setIsEmojiClicked(false);
  }

  const endRef = useRef(null);
  const currentUserRef = useRef(currentUser);

  useEffect(() => {
    endRef?.current?.scrollIntoView({ behavior: "smooth" });
  });

  useEffect(() => {
    //fetch chats on reload

    const fetchChats = async () => {
      const promise = await db.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION,
        [Query.equal("chatID", chatID), Query.orderAsc("$createdAt")],
      );

      // const receivedMessages = promise.
      setMessages(promise.documents);
      // console.log(promise.documents);
    };
    fetchChats();

    const unsub = appwriteClient.subscribe(
      `databases.${import.meta.env.VITE_APPWRITE_DATABASE_ID}.collections.${import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION}.documents`,
      (res) => {
        if (res.events.some((e) => e.includes("create"))) {
          if (res.payload.chatID === chatID) {
            setMessages((prev) => [...prev, res.payload]);
          }
        }
      },
    );
    return () => unsub();
  }, [chatID]);

  console.log("real time messages: ", messages);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    if (!receiverUser?.$id) return;
    const unsub = appwriteClient.subscribe(
      `databases.${import.meta.env.VITE_APPWRITE_DATABASE_ID}.collections.${import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID}.documents.${receiverUser.$id}`,
      (response) => {
        const updatedReceiver = response.payload;
        dispatch(
          changeChat({
            chatID,
            receiverUser: updatedReceiver,
            currentUser: currentUserRef.current,
          }),
        );
      },
    );

    return () => unsub();
  }, [receiverUser?.$id, chatID, dispatch, currentUser]);

  async function handleSend() {
    if (text === "") return;
    let oldText = text;
    setText("");
    try {
      await db.createDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION,
        ID.unique(),
        {
          senderId: userData.$id,
          text,
          chatID,
          ...(img.file && { img: img.url }),
        },
      );

      // sender
      const senderChatDoc = await db.getDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERCHAT_TABLE_ID,
        userData.$id,
      );
      const updatedChats = senderChatDoc.chats
        .map((c) => JSON.parse(c))
        .map((chat) =>
          chat.chatId === chatID
            ? { ...chat, lastMessage: text, isSeen: true }
            : chat,
        );
      await db.updateDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERCHAT_TABLE_ID,
        userData.$id,
        { chats: updatedChats.map((c) => JSON.stringify(c)) },
      );

      // receiver
      const receiverChatDoc = await db.getDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERCHAT_TABLE_ID,
        receiverUser.$id,
      );
      const updatedReceiverChats = receiverChatDoc.chats
        .map((c) => JSON.parse(c))
        .map((chat) =>
          chat.chatId === chatID
            ? { ...chat, lastMessage: text, isSeen: false }
            : chat,
        );
      await db.updateDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_USERCHAT_TABLE_ID,
        receiverUser.$id,
        { chats: updatedReceiverChats.map((c) => JSON.stringify(c)) },
      );
    } catch (error) {
      setText(oldText);
      console.log(error.message);
    } finally {
      setText("");
      setImg({ file: null, url: "" });
    }
  }

  function handleShowImg(e) {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]) ,
      });
    }
  }

  console.log(receiverSeen);

  return (
    <div className="chat flex flex-col flex-2 border-x border-x-[#dddddd35] h-full">
      <div className="top p-5 w-full flex items-center justify-between border-b  border-b-[#dddddd35]">
        <div className="userInfo flex items-center gap-5">
          <img
            src={
              !isBlocked ? receiverUser.avatar || "/avatar.png" : "/blocked.png"
            }
            alt="receiverUserAvatar"
            className="w-15 h-15 rounded-full object-cover"
          />
          <div className="texts flex flex-col gap-1.25 ">
            <span className="text-[18px] font-bold">
              {!isBlocked
                ? receiverUser.username || "Unknown"
                : "Your Cannot Send Message"}
            </span>
            <p className="text-sm font-light text-[#a5a5a5]">{"dummy text"}</p>
          </div>
        </div>
        <div className="icons flex gap-5">
          <img
            src="/phone.png"
            alt="phone"
            className="w-5 h-5 cursor-pointer"
          />
          <img
            src="/video.png"
            alt="video"
            className="w-5 h-5 cursor-pointer"
          />
          <img src="/info.png" alt="info" className="w-5 h-5 cursor-pointer" />
        </div>
      </div>

      <div className="center flex flex-col  gap-5 flex-1 p-5 overflow-auto">
        {!isCurrentUserBlocked && !isReceiverBlocked ? (
          messages?.map((message) => {
            const isOwnMessage = message.senderId === userData.$id;
            return (
              <div
                className={`message flex items-center gap-3 cursor-pointer ${!isOwnMessage ? `ml-auto` : "mr-auto"}`}
                key={message?.text}
              >
                <img
                  src={
                    (isOwnMessage ? userData.avatar : receiverUser.avatar) ||
                    "/avatar.png"
                  }
                  alt="avatar"
                  className="w-7.5 h-7.5 object-cover rounded-full"
                />
                <div className="text flex flex-col  gap-1.25">
                  <p className="p-5 bg-theme rounded-xl">
                    {message.text || "no message yet"}
                  </p>
                  {isOwnMessage ? (
                    !receiverSeen ? (
                      <CheckCheck
                        className="ml-auto mr-1"
                        size={15}
                        color="white"
                      />
                    ) : (
                      <CheckCheck
                        className="ml-auto mr-1"
                        size={15}
                        color="blue"
                      />
                    )
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-[rgba(230,74,105,0.2)] flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-[rgba(230,74,105,0.9)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg">
              Conversation Blocked
            </h3>
            <p className="text-stone-400 text-sm leading-relaxed max-w-55">
              Unblock to restart again
            </p>
          </div>
        )}

        {img.url && (
          <div
            className={`messages flex items-center gap-3 cursor-pointer ml-auto`}
          >
            <div className="texts flex flex-col gap-1.25 w-50 h-50">
              <img src={img.url} alt="senderImg" />
            </div>
          </div>
        )}

        <div ref={endRef}></div>
      </div>

      <div className="bottom p-5 flex gap-5 items-center justify-between border-t border-t-[#dddddd35]">
        <div className="icons flex items-center gap-5">
          <label htmlFor="file">
            <img src="/img.png" alt="" className="w-5 h-5 cursor-pointer" />
          </label>
          <input
            type="file"
            name="file"
            id="file"
            className={`hidden`}
            onChange={handleShowImg}
          />
          <img src="/camera.png" alt="" className="w-5 h-5" />
          <img src="/mic.png" alt="" className="w-5 h-5" />
        </div>
        <input
          type="text"
          name="icons"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? handleSend() : null)}
          value={text || ""}
          id="icons"
          placeholder="Type a message..."
          className="flex-1 border-none outline-none text-white bg-theme p-5 rounded-xl font-normal"
        />
        <div
          className="emoji relative"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsEmojiClicked(false);
            }
          }}
        >
          <button
            type="button"
            onClick={() => setIsEmojiClicked((prev) => !prev)}
          >
            <img
              src="/emoji.png"
              alt="emoji"
              className="w-5 h-5 cursor-pointer"
            />
          </button>
          <AnimatePresence>
            {isEmojiClicked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 6 }}
                transition={{
                  type: "spring",
                  stiffness: 600,
                  damping: 35,
                  mass: 0.6,
                  duration: 0.12,
                }}
                className="picker absolute bottom-full left-1 z-10 cursor-pointer"
              >
                <EmojiPicker onEmojiClick={handleEmoji} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          disabled={isBlocked}
          type="button"
          onClick={handleSend}
          className={` px-5 py-2.5 border-0 rounded-md ${!isBlocked ? "bg-[#5183fe] text-white cursor-pointer hover:bg-[#2e5dd4] transition-colors duration-300" : "bg-[#3f5ba3] text-white cursor-not-allowed"}`}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
