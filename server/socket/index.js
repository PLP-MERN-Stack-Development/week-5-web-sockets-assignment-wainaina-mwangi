// index.js
module.exports = function (io) {
  const users = {};
  const messages = {};

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_room', ({ username, room }) => {
      socket.join(room);

      users[socket.id] = { username, room };
      console.log(`${username} joined room: ${room}`);

      if (!messages[room]) messages[room] = [];

      io.to(room).emit('room_users', getUsersInRoom(room));
      socket.to(room).emit('user_joined', { username });
      socket.emit('room_messages', messages[room]);
    });

    socket.on('send_message', ({ text }) => {
      const user = users[socket.id];
      if (!user) return;

      const message = {
        id: Date.now(),
        sender: user.username,
        senderId: socket.id,
        room: user.room,
        text,
        timestamp: new Date().toISOString(),
      };

      messages[user.room].push(message);
      if (messages[user.room].length > 100) messages[user.room].shift();

      io.to(user.room).emit('receive_message', message);
    });

    socket.on('disconnect', () => {
      const user = users[socket.id];
      if (user) {
        const { username, room } = user;
        socket.to(room).emit('user_left', { username });
        delete users[socket.id];
        io.to(room).emit('room_users', getUsersInRoom(room));
      }
    });

    function getUsersInRoom(room) {
      return Object.values(users).filter((u) => u.room === room);
    }
  });
};
