const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// 登録されているチャットルームの一覧。
// Mapで、ルームと入室人数を管理するように変更
const rooms = new Map();

// クライアントが接続
io.on("connection", (socket) => {
  console.log("ユーザーが接続しました。Socket ID:", socket.id);

  const allMessages = [];

  // 過去のメッセージを送信
  //   Message.find().then((messages) => {
  //     socket.emit("previousMessages", messages);
  //   });

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
    console.log("ユーザーが退出しました");
    handleLeave(socket);
  });

  // 切断時の処理
  socket.on("disconnect", () => {
    console.log("ユーザーが切断されました");
    handleLeave(socket);
  });

  // チャットルームの一覧を取得
  socket.on("getRoomList", () => {
    socket.emit("roomList", Array.from(rooms.keys()));
  });

  // チャットルームに入室
  socket.on("joinRoom", ({ username, room }) => {
    // 入室するチャットルームを、一覧に追加
    if (!rooms.has(room)) {
      rooms.set(room, new Set());

      // 全クライアントにルーム一覧を送信
      io.emit("roomList", Array.from(rooms.keys()));
    }
    rooms.get(room).add(username);

    socket.join(room);
    socket.username = username;
    socket.room = room;

    socket
      .to(room)
      .emit("userJoined", `${username} さんが入室しました。id=${socket.id}`);
  });
});

// 退出時の共通処理
function handleLeave(socket) {
  const { username, room } = socket;
  if (!room || !username) return;

  const roomUsers = rooms.get(room);
  if (roomUsers) {
    roomUsers.delete(username);

    // 最後のユーザーならルームごと削除
    if (roomUsers.size === 0) {
      rooms.delete(room);
      io.emit("roomList", Array.from(rooms.keys())); // 全員にルーム一覧を再送
    }
  }

  // 送信元以外の全クライアントに送信
  socket.to(room).emit("userJoined", `${username} さんが退室しました。`);
  socket.leave(room);
  socket.room = null;
}

// サーバー起動
server.listen(5000, () => {
  console.log("サーバーが起動しました (ポート5000)");
});
