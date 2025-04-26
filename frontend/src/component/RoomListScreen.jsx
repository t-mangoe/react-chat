import { socket } from "../socket/socket";
import { useState, useEffect } from "react";

const RoomListScreen = ({ onEnterRoom }) => {
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState("");

  useEffect(() => {
    // ルームの一覧をリクエスト
    socket.emit("getRoomList");

    // サーバからルーム一覧が返ってきたとき
    socket.on("roomList", (roomList) => {
      setRooms(roomList);
    });

    // クリーンアップ（イベントの重複防止）
    return () => {
      socket.off("roomList");
    };
  }, []);

  return (
    <div>
      <h2>チャットルームを選んでください</h2>
      <ul>
        {rooms.map((room) => (
          <li key={room}>
            <button onClick={() => onEnterRoom(room)}>{room}</button>
          </li>
        ))}
      </ul>

      <h3>新しいルームを作成</h3>
      <input
        value={newRoom}
        onChange={(e) => setNewRoom(e.target.value)}
        placeholder="ルーム名"
      />
      <button onClick={() => onEnterRoom(newRoom)}>作成して入室</button>
    </div>
  );
};

export default RoomListScreen;
