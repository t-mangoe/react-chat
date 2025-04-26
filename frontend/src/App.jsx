import React, { useState, useEffect } from "react";
// import { ChatContainer, ConversationList, Conversation, MessageList, Message, MessageInput } from "chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import ChatScreen from "./component/ChatScreen";
import NameInputScreen from "./component/NameInputScreen";
import RoomListScreen from "./component/RoomListScreen";

const App = () => {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");

  if (!username) return <NameInputScreen onEnter={setUsername} />;
  if (!room) return <RoomListScreen onEnterRoom={setRoom} />;

  return (
    <ChatScreen username={username} room={room} onExit={() => setRoom("")} />
  );

  // return (
  //   <>
  //     {username ? (
  //       <ChatScreen username={username} onExit={() => setUsername("")} />
  //     ) : (
  //       <NameInputScreen onEnter={setUsername} />
  //     )}
  //   </>
  // );
};

export default App;
