import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

function Chat() {
  const [isEmojiClicked, setIsEmojiClicked] = useState(false);
  const [text, setText] = useState("");
  function handleEmoji(e) {
    setText((prev) => prev + e.emoji);
    setIsEmojiClicked(false);
  }

  const endRef = useRef(null);
  console.log(text);

  useEffect(() => {
    endRef?.current?.scrollIntoView({ behavior: "smooth" });
  });

  return (
    <div className="chat flex flex-col flex-2 border-x border-x-[#dddddd35] h-full">
      <div className="top p-5 w-full flex items-center justify-between border-b  border-b-[#dddddd35]">
        <div className="userInfo flex items-center gap-5">
          <img
            src="./avatar.png"
            alt=""
            className="w-15 h-15 rounded-full object-cover"
          />
          <div className="texts flex flex-col gap-1.25 ">
            <span className="text-[18px] font-bold">Jan Doe</span>
            <p className="text-sm font-light text-[#a5a5a5]">
              Lorem ipsum dolor sit amet.
            </p>
          </div>
        </div>
        <div className="icons flex gap-5">
          <img
            src="./phone.png"
            alt="phone"
            className="w-5 h-5 cursor-pointer"
          />
          <img
            src="./video.png"
            alt="video"
            className="w-5 h-5 cursor-pointer"
          />
          <img src="./info.png" alt="info" className="w-5 h-5 cursor-pointer" />
        </div>
      </div>

      <div className="center flex flex-col  gap-5 flex-1 p-5 overflow-auto">
        <div className="message flex items-center  gap-3 cursor-pointer">
          <img
            src="./avatar.png"
            alt="avatar"
            className="w-7.5 h-7.5 object-cover rounded-full"
          />
          <div className="text flex flex-col  gap-1.25">
            <p className="p-5 bg-theme rounded-xl">
              Lorem ipsum dolor sit amet.
            </p>
            <span className="">1 min ago</span>
          </div>
        </div>

        <div className="message own flex flex-col gap-5 p-5 ml-auto">
          <div className="text">
            <p className="bg-[#5183fe] p-5 mb-1 rounded-md">
              Lorem ipsum dolor sit amet.
            </p>
            <span>1 min ago</span>
          </div>
        </div>
        <div className="message">
          <img src="./avatar.png" alt="avatar" />
          <div className="text">
            <p>Lorem ipsum dolor sit amet.</p>
            <span>1 min ago</span>
          </div>
        </div>
        <div className="message own ml-auto">
          <div className="text">
            <p>Lorem ipsum dolor sit amet.</p>
            <span>1 min ago</span>
          </div>
        </div>
        <div ref={endRef}></div>
      </div>

      <div className="bottom p-5 flex gap-5 items-center justify-between border-t border-t-[#dddddd35]">
        <div className="icons flex items-center gap-5">
          <img src="./img.png" alt="" className="w-5 h-5" />
          <img src="./camera.png" alt="" className="w-5 h-5" />
          <img src="./mic.png" alt="" className="w-5 h-5" />
        </div>
        <input
          type="text"
          name="icons"
          onChange={(e) => setText(e.target.value)}
          value={text}
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
              src="./emoji.png"
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
          type="button"
          className="bg-[#5183fe] text-white px-5 py-2.5 border-0 rounded-md cursor-pointer"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
