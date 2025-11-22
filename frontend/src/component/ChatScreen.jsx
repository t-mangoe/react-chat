import React, { useState, useEffect } from "react";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  MessageSeparator,
  ConversationHeader,
  StarButton,
  VoiceCallButton,
  VideoCallButton,
  InfoButton,
} from "@chatscope/chat-ui-kit-react";
// import io from "socket.io-client";
import { socket } from "../socket/socket";

// const socket = io.connect("http://192.168.11.50:5000");

const ChatScreen = ({ username, room, onExit }) => {
  const [messages, setMessages] = useState([]);
  const [userListStr, setUserListStr] = useState("");

  // 入室メッセージの処理
  useEffect(() => {
    // 接続後にサーバーに自分の名前を送る
    // 開発モードだと、useEffectが２回呼び出されるので、注意
    // socket.emit("join", username);
    socket.emit("joinRoom", { username, room });

    // 「○○さんが入室しました」の通知を受信
    socket.on("userJoined", (msg) => {
      const systemMessage = {
        type: "separator",
        text: msg,
        sender: "system",
        sentTime: new Date().toLocaleTimeString(),
        direction: "incoming",
      };
      setMessages((prev) => [...prev, systemMessage]);
    });

    socket.on("updateUserList", (msg) => {
      setUserListStr(msg);
    });

    return () => {
      socket.off("userJoined");
    };
  }, []);

  // サーバーからメッセージを受信
  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          type: "message",
          text: message,
          sender: "bot",
          direction: "incoming",
        },
      ]);
    });

    return () => socket.off("receiveMessage");
  }, []);

  const handleSendMessage = (text) => {
    setMessages([
      ...messages,
      { text, type: "message", sender: "user", direction: "outgoing" },
    ]);
    // サーバに送信
    socket.emit("sendMessage", text);
  };

  const handleExit = () => {
    // サーバ側に退室を通知。サーバ側で「○○さんが退室しました」を通知させるため。
    socket.emit("leave", username);
    // フロントエンド側で、チャット画面を終了。名前入力画面に戻る
    onExit();
  };

  return (
    <div style={{ position: "relative", height: "500px" }}>
      <div style={{ padding: "10px", textAlign: "right", background: "#eee" }}>
        {/* <div>ルーム: {room}</div> */}
        <span style={{ marginRight: "1em" }}>ようこそ、{username} さん</span>
        <button onClick={handleExit}>退室</button>
      </div>

      <ConversationHeader>
        <ConversationHeader.Back />
        <div>ルーム: {room}</div>
        <ConversationHeader.Content
          info={`ルーム: ${room}`}
          userName={userListStr}
        />
        <ConversationHeader.Actions>
          <StarButton title="Add to favourites" />
          <VoiceCallButton title="Start voice call" />
          <VideoCallButton title="Start video call" />
          <InfoButton title="Show info" />
        </ConversationHeader.Actions>
      </ConversationHeader>
      <MainContainer>
        <ChatContainer>
          <MessageList>
            {/* <Message
              model={{
                message: "よろしくね",
                sentTime: "just now",
                sender: "Joe",
              }}
            /> */}
            {messages.map((msg, index) =>
              msg.type === "separator" ? (
                <MessageSeparator key={index} content={msg.text} />
              ) : (
                <Message
                  key={index}
                  model={{
                    message: msg.text,
                    sender: msg.sender,
                    direction: msg.direction,
                  }}
                />
              )
            )}
          </MessageList>
          <MessageInput
            placeholder="メッセージを入力..."
            onSend={handleSendMessage}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default ChatScreen;
