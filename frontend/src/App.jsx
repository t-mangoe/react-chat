import React, { useState, useEffect } from "react";
// import { ChatContainer, ConversationList, Conversation, MessageList, Message, MessageInput } from "chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import ChatScreen from "./component/ChatScreen";
import NameInputScreen from "./component/NameInputScreen";

// const socket = io.connect("http://192.168.11.50:5000");

const App = () => {
  const [username, setUsername] = useState("");

  return (
    <>
      {username ? (
        <ChatScreen username={username} onExit={() => setUsername("")} />
      ) : (
        <NameInputScreen onEnter={setUsername} />
      )}
    </>
  );
};

export default App;
