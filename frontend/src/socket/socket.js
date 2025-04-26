import { io } from "socket.io-client";

// サーバーのURLに合わせて変更（ローカル開発中は http://localhost:3000 など）
export const socket = io("http://192.168.11.50:5000");
