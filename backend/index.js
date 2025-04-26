const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// クライアントが接続
io.on("connection", (socket) => {
  console.log("ユーザーが接続しました。Socket ID:", socket.id);

  const allMessages = [];

  // 登録されているチャットルームの一覧。Setで重複を排除
  const rooms = new Set(["Room1", "Room2"]);

  // 過去のメッセージを送信
  //   Message.find().then((messages) => {
  //     socket.emit("previousMessages", messages);
  //   });

  // ユーザー名を登録
  // socket.on("join", (username) => {
  //   socket.username = username;

  //   // 他のユーザーに「○○が入室しました」と通知
  //   socket.broadcast.emit(
  //     "userJoined",
  //     `${username} さんが入室しました。id=${socket.id}`
  //   );
  // });

  // メッセージ受信
  socket.on("sendMessage", async (msg) => {
    const { username, room } = socket;
    // メッセージを保存
    allMessages.push({
      id: socket.id,
      text: msg,
    });
    // 送信元以外の全クライアントに送信
    // socket.broadcast.emit("receiveMessage", msg);
    socket.to(room).emit("receiveMessage", msg);
  });

  // ユーザが退出したときの処理
  socket.on("leave", () => {
    const { username, room } = socket;
    // 送信元以外の全クライアントに送信
    // socket.broadcast.emit("userJoined", `${username} さんが退室しました。`);
    socket.to(room).emit("userJoined", `${username} さんが退室しました。`);
    socket.leave(room);
    socket.room = null;
  });

  // 切断時の処理
  socket.on("disconnect", () => {
    const { username, room } = socket;
    console.log("ユーザーが切断しました");
    // if (socket.username) {
    //   socket.broadcast.emit(
    //     "userJoined",
    //     `${socket.username} さんが退室しました。`
    //   );
    // }
    socket.to(room).emit("userJoined", `${username} さんが退室しました。`);
    socket.leave(room);
    socket.room = null;
  });

  // チャットルームの一覧を取得
  socket.on("getRoomList", () => {
    socket.emit("roomList", Array.from(rooms));
  });

  // チャットルームに入室
  socket.on("joinRoom", ({ username, room }) => {
    socket.join(room);
    socket.username = username;
    socket.room = room;

    socket
      .to(room)
      .emit("userJoined", `${username} さんが入室しました。id=${socket.id}`);
  });
});

// サーバー起動
server.listen(5000, () => {
  console.log("サーバーが起動しました (ポート5000)");
});
