
// chatEvents.js

// 1. Import necessary modules/dependencies.
// Note: We assume 'userEvents.js' exports the 'users' object 
// (or a dynamic way to access the current user state) correctly.
const { users } = require('./userEvents');

// 2. Initialize a local message history buffer.
// Note: For production, this should be replaced with a database.
const messages = [];
const MESSAGE_HISTORY_LIMIT = 100;

/**
 * Handles chat-related Socket.IO events.
 * * @param {object} io - The Socket.IO server instance.
 * @param {object} socket - The current Socket.IO client socket.
 */
function chatEvents(io, socket) {

    // Helper function to get sender details
    const getSenderInfo = () => {
        // We use optional chaining (?.) and nullish coalescing (??) for safety
        const user = users[socket.id];
        return {
            username: user?.username ?? 'Anonymous',
            id: socket.id,
        };
    };

    /**
     * Handles 'send_message' (Public Chat) event.
     */
    socket.on('send_message', (messageData) => {
        const sender = getSenderInfo();
        
        // Construct the full message object with server-side metadata
        const message = {
            ...messageData, // Assuming messageData contains 'text' or similar
            id: Date.now(), // Simple unique ID
            sender: sender.username,
            senderId: sender.id,
            timestamp: new Date().toISOString(),
        };

        // Store and manage message history buffer
        messages.push(message);
        if (messages.length > MESSAGE_HISTORY_LIMIT) {
            messages.shift(); // Remove the oldest message
        }

        // Emit the message to all connected clients (including the sender)
        io.emit('receive_message', message);
    });

    /**
     * Handles 'private_message' event.
     * * @param {object} payload - Contains 'to' (recipient socket ID) and 'message' (content).
     */
    socket.on('private_message', ({ to, message }) => {
        const sender = getSenderInfo();

        // 1. Basic validation for recipient ID
        if (!to || !users[to]) {
            // Optional: Notify the sender if the recipient is offline or invalid.
            socket.emit('error_message', { 
                type: 'private_message_error', 
                message: `User ${to} is not available.` 
            });
            return;
        }

        // Construct the private message object
        const messageData = {
            id: Date.now(),
            sender: sender.username,
            senderId: sender.id,
            message: message,
            timestamp: new Date().toISOString(),
            isPrivate: true,
        };

        // 2. Send the message to the recipient
        // socket.to(to) targets a specific socket ID (the recipient).
        io.to(to).emit('private_message', messageData);

        // 3. Echo the message back to the sender
        // This ensures the sender sees the message in their chat history instantly.
        socket.emit('private_message', messageData);
    });
}

// 3. Export the event handler and the message history array (for initial loading)
module.exports = { 
    chatEvents, 
    messages 
};