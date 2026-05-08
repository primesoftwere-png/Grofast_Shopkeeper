import { io } from 'socket.io-client';
import { getToken } from '@/lib/axios';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://172.20.10.5:8000';

let socket = null;

export const initializeSocket = () => {
  if (socket?.connected) {
    console.log('Socket already connected');
    return socket;
  }

  const token = getToken();
  
  if (!token) {
    console.error('No token found, cannot connect to socket');
    return null;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token: token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✓ Connected to Socket.IO server');
    console.log('Socket ID:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('✗ Disconnected from Socket.IO server');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected');
  }
};

// ==================== SHOPKEEPER EVENTS ====================

/**
 * Listen for new orders
 * @param {Function} callback - Callback function (order) => {}
 */
export const onNewOrder = (callback) => {
  if (socket) {
    socket.on('new-order', callback);
  }
};

/**
 * Accept order (emit to server)
 * @param {string} orderId - Order ID
 */
export const acceptOrder = (orderId) => {
  if (socket) {
    console.log('Emitting order-accept:', orderId);
    socket.emit('order-accept', { orderId });
  }
};

/**
 * Listen for order accept success
 * @param {Function} callback - Callback function
 */
export const onOrderAcceptSuccess = (callback) => {
  if (socket) {
    socket.on('order-accept-success', callback);
  }
};

/**
 * Listen for delivery boy assigned
 * @param {Function} callback - Callback function
 */
export const onDeliveryAssigned = (callback) => {
  if (socket) {
    socket.on('delivery-assigned', callback);
  }
};

/**
 * Listen for order status updates
 * @param {Function} callback - Callback function
 */
export const onOrderStatus = (callback) => {
  if (socket) {
    socket.on('order-status', callback);
  }
};

/**
 * Listen for order delivered
 * @param {Function} callback - Callback function
 */
export const onOrderDelivered = (callback) => {
  if (socket) {
    socket.on('order_delivered', callback);
  }
};

// Cleanup functions
export const offNewOrder = () => {
  if (socket) {
    socket.off('new-order');
  }
};

export const offOrderAcceptSuccess = () => {
  if (socket) {
    socket.off('order-accept-success');
  }
};

export const offDeliveryAssigned = () => {
  if (socket) {
    socket.off('delivery-assigned');
  }
};

export const offOrderStatus = () => {
  if (socket) {
    socket.off('order-status');
  }
};

export const offOrderDelivered = () => {
  if (socket) {
    socket.off('order_delivered');
  }
};
