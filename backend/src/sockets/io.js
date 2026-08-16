let io = null;

export const setIO = (server) => {
  io = server;
};

export const getIO = () => io;

export const emitToUser = (userId, event, data) => {
  io?.to(`user:${userId}`).emit(event, data);
};

export const emitToBooking = (bookingRequestId, event, data) => {
  io?.to(`booking:${bookingRequestId}`).emit(event, data);
};