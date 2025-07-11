const users = {};
const typingUsers = {};

function userEvents(io, socket) {
  socket.on('user_join', (username) => {
    users[socket.id] = { username, id: socket.id };
    io.emit('user_list', Object.values(users));
    io.emit('user_joined', { username, id: socket.id });
  });

  socket.on('typing', (isTyping) => {
    const username = users[socket.id]?.username;
    if (!username) return;

    isTyping ? typingUsers[socket.id] = username : delete typingUsers[socket.id];
    io.emit('typing_users', Object.values(typingUsers));
  });

  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username } = users[socket.id];
      io.emit('user_left', { username, id: socket.id });
    }
    delete users[socket.id];
    delete typingUsers[socket.id];
    io.emit('user_list', Object.values(users));
    io.emit('typing_users', Object.values(typingUsers));
  });
}

module.exports = { userEvents, users, typingUsers };
