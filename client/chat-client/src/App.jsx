import React, { useEffect, useState } from 'react';
import socket from './socket/socket';

const rooms = ['general', 'tech', 'random'];

function App() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('general');
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    socket.on('receive_message', (msg) => setMessages((prev) => [...prev, msg]));
    socket.on('room_messages', (msgs) => setMessages(msgs));
    return () => {
      socket.off('receive_message');
      socket.off('room_messages');
    };
  }, []);

  const joinRoom = () => {
    if (!username.trim()) return;
    socket.emit('join_room', { username, room });
    setJoined(true);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit('send_message', { text: input });
    setInput('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {!joined ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4 text-center">Join a Room</h2>
          <input
            className="w-full p-2 border rounded mb-4"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <select
            className="w-full p-2 border rounded mb-4"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          >
            {rooms.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
          <button
            onClick={joinRoom}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            Join Room
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg flex flex-col h-[80vh]">
          <h3 className="text-lg font-semibold mb-2">
            Room: <span className="text-blue-600">{room}</span>
          </h3>
          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-gray-100 p-2 rounded">
                <strong className="text-blue-600">{msg.sender}</strong>: {msg.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 p-2 border rounded"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type message"
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
