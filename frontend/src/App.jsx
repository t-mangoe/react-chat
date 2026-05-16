import React, { useState, useEffect } from "react";
// import { ChatContainer, ConversationList, Conversation, MessageList, Message, MessageInput } from "chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import ChatScreen from "./component/ChatScreen";
import NameInputScreen from "./component/NameInputScreen";
import RoomListScreen from "./component/RoomListScreen";

const App = () => {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    // セッションストレージからユーザ名とルームの情報を復元
    const saved = sessionStorage.getItem("chatUser");

    if (saved) {
      const { username: savedUsername, room: savedRoom } = JSON.parse(saved);

      setUsername(savedUsername);
      setRoom(savedRoom);
    }

    setIsRestoring(false);
  }, []);

  // 復元中は描画しない
  if (isRestoring) return null;

  if (!username) return <NameInputScreen onEnter={setUsername} />;
  if (!room) return <RoomListScreen onEnterRoom={setRoom} />;

  return (
    <ChatScreen
      username={username}
      room={room}
      onExit={() => {
        sessionStorage.removeItem("chatUser");
        setUsername("");
        setRoom("");
      }}
    />
  );
};

export default App;
