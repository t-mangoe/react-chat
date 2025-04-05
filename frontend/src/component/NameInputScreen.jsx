import React, { useState } from "react";

const NameInputScreen = ({ onEnter }) => {
  const [name, setName] = useState("");

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>ユーザー名を入力してください</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="あなたの名前"
        style={{ padding: "8px", fontSize: "16px", width: "200px" }}
      />
      <br />
      <button
        onClick={() => name && onEnter(name)}
        style={{ marginTop: "16px", padding: "8px 16px" }}
      >
        入室
      </button>
    </div>
  );
};

export default NameInputScreen;
