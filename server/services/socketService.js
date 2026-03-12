export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('send_message', (data) => {
      socket.to(`conversation:${data.conversationId}`).emit('receive_message', data);
    });

    socket.on('typing', (data) => {
      socket.to(`conversation:${data.conversationId}`).emit('typing', {
        userId: data.userId,
        userName: data.userName,
      });
    });

    socket.on('stop_typing', (data) => {
      socket.to(`conversation:${data.conversationId}`).emit('stop_typing', {
        userId: data.userId,
      });
    });

    socket.on('join_user_room', (userId) => {
      socket.join(`user:${userId}`);
    });

    // Squad rooms
    socket.on('join_squad', (postId) => {
      socket.join(`squad:${postId}`);
    });

    socket.on('leave_squad', (postId) => {
      socket.leave(`squad:${postId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

export const sendNotification = (io, userId, notification) => {
  io.to(`user:${userId}`).emit('notification', notification);
};

export const broadcastEventUpdate = (io, eventId, data) => {
  io.to(`event:${eventId}`).emit('event_update', data);
};
