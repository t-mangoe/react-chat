const mongoose = require("mongoose");

// MongoDBにチャットを保存するためのスキーマ
const messageSchema = new mongoose.Schema({
  room: { type: String, required: true }, // どのルームの投稿か
  username: { type: String, required: true }, // 投稿者名
  text: { type: String, required: true }, // メッセージ内容
  timestamp: { type: Date, default: Date.now }, // 投稿日時
});

module.exports = mongoose.model("Message", messageSchema);
