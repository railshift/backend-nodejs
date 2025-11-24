import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import logger from '../utils/logger.js';
import { socketConnections } from '../config/metrics.js';

// Connected users map
const connectedUsers = new Map();

export const initializeSocket = (io) => {
  // Socket.io authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`✅ Socket connected: ${socket.id} | User: ${socket.userId}`);

    // Add to connected users
    connectedUsers.set(socket.userId, socket.id);
    socketConnections.inc();

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Join role-specific room
    socket.join(`role:${socket.userRole}`);

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to Railway Shift Management System',
      socketId: socket.id,
    });

    // Handle shift room join
    socket.on('join:shift', (shiftId) => {
      socket.join(`shift:${shiftId}`);
      logger.info(`User ${socket.userId} joined shift room: ${shiftId}`);
      socket.emit('joined:shift', { shiftId });
    });

    // Handle shift room leave
    socket.on('leave:shift', (shiftId) => {
      socket.leave(`shift:${shiftId}`);
      logger.info(`User ${socket.userId} left shift room: ${shiftId}`);
      socket.emit('left:shift', { shiftId });
    });

    // Handle staff tracking subscription
    socket.on('subscribe:staff', (staffId) => {
      socket.join(`staff:${staffId}`);
      logger.info(`User ${socket.userId} subscribed to staff: ${staffId}`);
    });

    // Handle staff tracking unsubscription
    socket.on('unsubscribe:staff', (staffId) => {
      socket.leave(`staff:${staffId}`);
      logger.info(`User ${socket.userId} unsubscribed from staff: ${staffId}`);
    });

    // Handle notification acknowledgment
    socket.on('notification:ack', (data) => {
      logger.info(`Notification acknowledged by ${socket.userId}:`, data);
      io.to(`shift:${data.shiftId}`).emit('notification:acknowledged', {
        notificationId: data.notificationId,
        acknowledgedBy: socket.userId,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle relief decision
    socket.on('relief:decision', (data) => {
      logger.info(`Relief decision from ${socket.userId}:`, data);
      io.to(`shift:${data.shiftId}`).emit('relief:update', {
        shiftId: data.shiftId,
        decision: data.decision,
        decidedBy: socket.userId,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle ping
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // Disconnection handler
    socket.on('disconnect', (reason) => {
      logger.info(`❌ Socket disconnected: ${socket.id} | Reason: ${reason}`);
      connectedUsers.delete(socket.userId);
      socketConnections.dec();
    });

    // Error handler
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  return io;
};

// Helper function to emit to specific user
export const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

// Helper function to emit to specific shift
export const emitToShift = (io, shiftId, event, data) => {
  io.to(`shift:${shiftId}`).emit(event, data);
};

// Helper function to emit to specific staff
export const emitToStaff = (io, staffId, event, data) => {
  io.to(`staff:${staffId}`).emit(event, data);
};

// Helper function to emit to specific role
export const emitToRole = (io, role, event, data) => {
  io.to(`role:${role}`).emit(event, data);
};

// Helper function to broadcast to all connected users
export const broadcastToAll = (io, event, data) => {
  io.emit(event, data);
};

export { connectedUsers };
