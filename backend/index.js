const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./db");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// 登録されているチャットルームの一覧。
// Mapで、ルームと入室人数を管理するように変更
const rooms = new Map();

// MongoDBとの接続処理
connectDB();

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

    // DBに保存
    const dbMessage = await Message.create({
      room,
      username,
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
  socket.on("joinRoom", async ({ username, room }) => {
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
    // ユーザリストの更新を実施
    updateUserList(socket);

    try {
      // 🔽 過去メッセージを取得（古い順）
      const messages = await Message.find({ room })
        .sort({ timestamp: 1 })
        .limit(50); // 最初は50件くらいがおすすめ

      // 🔽 入室した本人にだけ送る
      socket.emit("chatHistory", messages);
    } catch (err) {
      console.error("履歴取得エラー:", err);
    }
  });
});

// 退出時の共通処理
function handleLeave(socket) {
  const { username, room } = socket;
  if (!room || !username) return;

  // ルームに入室しているユーザの一覧を取得
  const roomUsers = rooms.get(room);
  if (roomUsers) {
    // 退出したユーザをルームのユーザ一覧から削除
    roomUsers.delete(username);

    // 送信元以外の全クライアントに送信
    socket.to(room).emit("userJoined", `${username} さんが退室しました。`);
    socket.leave(room);

    // ユーザリストの更新を実施
    updateUserList(socket);

    // 最後のユーザーならルームごと削除
    if (roomUsers.size === 0) {
      rooms.delete(room);
      io.emit("roomList", Array.from(rooms.keys())); // 全員にルーム一覧を再送
    }
  }

  socket.room = null;
}

// クライアント側にルームに入室しているユーザリストを通知
function updateUserList(socket) {
  const { username, room } = socket;

  // 登録されているユーザの名前一覧をカンマ区切りで文字列化
  const usersNames = [...rooms.get(room)].join(",");
  // 送信元以外の全クライアントに送信
  socket.to(room).emit("updateUserList", usersNames);
  // 自分のユーザ一覧を更新するため、自分にも送信
  socket.emit("updateUserList", usersNames);
}

// サーバー起動
server.listen(5000, () => {
  console.log("サーバーが起動しました (ポート5000)");
});
