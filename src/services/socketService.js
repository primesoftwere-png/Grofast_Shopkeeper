import { io } from 'socket.io-client';
import { getToken, getUser } from '@/lib/axios';

const normalizeSocketUrl = (url) => (url || 'http://172.20.10.5:8000')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');

const SOCKET_URL = normalizeSocketUrl(
  process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'http://172.20.10.5:8000'
);

let socket = null;

const toIdString = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value._id || value.id || null;
  return String(value);
};

export const getShopkeeperRoomIds = () => {
  const user = getUser();
  const roomIds = [
    toIdString(user?.userId),
    toIdString(user?.user?._id),
    toIdString(user?.shopkeeper?.userId),
    toIdString(user?._id),
    toIdString(user?.id),
    toIdString(user?.shopkeeper?._id),
  ].filter(Boolean);

  return [...new Set(roomIds)];
};

export const joinShopkeeperRooms = () => {
  if (!socket) {
    console.error('Cannot join shopkeeper rooms - socket not initialized');
    return [];
  }

  const roomIds = getShopkeeperRoomIds();
  roomIds.forEach((roomId) => {
    socket.emit('join', roomId, (response) => {
      if (response?.success) {
        console.log(`Joined socket room: ${roomId}`);
      } else if (response) {
        console.warn(`Could not join socket room ${roomId}:`, response.message);
      }
    });
  });

  return roomIds;
};

export const initializeSocket = () => {
  if (socket) {
    if (socket.connected) {
      console.log('✅ Socket already connected');
      console.log('   Socket ID:', socket.id);
      console.log('   Connected:', socket.connected);
      joinShopkeeperRooms();
    } else {
      console.log('⏳ Socket already initialized, waiting for connection...');
    }
    return socket;
  }

  const token = getToken();
  
  if (!token) {
    console.error('❌ No token found, cannot connect to socket');
    console.error('   Please login first');
    return null;
  }

  console.log('========================================');
  console.log('🔌 INITIALIZING SOCKET CONNECTION');
  console.log('========================================');
  console.log('Socket URL:', SOCKET_URL);
  console.log('Token:', token ? `${token.substring(0, 20)}...` : 'null');
  console.log('Timestamp:', new Date().toISOString());
  console.log('========================================');

  socket = io(SOCKET_URL, {
    auth: {
      token: token,
    },
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionDelay: 3000,
    reconnectionDelayMax: 10000,
    reconnectionAttempts: 5,
    timeout: 10000,
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('========================================');
    console.log('✅ SOCKET.IO CONNECTED SUCCESSFULLY');
    console.log('========================================');
    console.log('Socket ID:', socket.id);
    console.log('Transport:', socket.io.engine.transport.name);
    console.log('Connected:', socket.connected);
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================================');
    joinShopkeeperRooms();
  });

  socket.on('disconnect', (reason) => {
    console.log('========================================');
    console.log('⚠️ SOCKET.IO DISCONNECTED');
    console.log('========================================');
    console.log('Reason:', reason);
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================================');
  });

  socket.on('connect_error', (error) => {
    console.log('========================================');
    console.log('❌ SOCKET.IO CONNECTION ERROR');
    console.log('========================================');
    console.log('Error Message:', error.message);
    console.log('Error Type:', error.type);
    console.log('Error Description:', error.description);
    console.log('Socket URL:', SOCKET_URL);
    console.log('Token Present:', !!token);
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================================');
    console.log('💡 Troubleshooting:');
    console.log('   1. Check if backend is running on', SOCKET_URL);
    console.log('   2. Verify token is valid');
    console.log('   3. Check CORS settings on backend');
    console.log('   4. Ensure Socket.IO is initialized on backend');
    console.log('========================================');
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('========================================');
    console.log('✅ SOCKET.IO RECONNECTED');
    console.log('========================================');
    console.log('Attempt Number:', attemptNumber);
    console.log('Socket ID:', socket.id);
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================================');
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('🔄 Reconnection attempt', attemptNumber);
  });

  socket.on('reconnect_error', (error) => {
    console.log('❌ Reconnection error:', error.message);
  });

  socket.on('reconnect_failed', () => {
    console.log('❌ Reconnection failed - max attempts reached');
  });

  // Listen for authentication errors
  socket.on('error', (error) => {
    console.log('========================================');
    console.log('❌ SOCKET ERROR EVENT');
    console.log('========================================');
    console.log('Error:', error);
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================================');
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('🔌 Disconnecting socket...');
    socket.disconnect();
    socket = null;
    console.log('✅ Socket disconnected');
  }
};

// ==================== SHOPKEEPER EVENTS ====================

/**
 * Listen for new orders
 * @param {Function} callback - Callback function (order) => {}
 */
export const onNewOrder = (callback) => {
  if (socket) {
    console.log('👂 Registering listener for: new-order');
    socket.on('new-order', (data) => {
      console.log('========================================');
      console.log('🔔 NEW-ORDER EVENT RECEIVED');
      console.log('========================================');
      console.log('Data:', data);
      console.log('Timestamp:', new Date().toISOString());
      console.log('========================================');
      callback(data);
    });
  } else {
    console.error('❌ Cannot register new-order listener - socket not initialized');
  }
};

/**
 * Accept order (emit to server)
 * @param {string} orderId - Order ID
 */
export const acceptOrder = (orderId) => {
  if (socket) {
    console.log('========================================');
    console.log('📤 EMITTING: order-accept');
    console.log('========================================');
    console.log('Order ID:', orderId);
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================================');
    socket.emit('order-accept', { orderId });
  } else {
    console.error('❌ Cannot emit order-accept - socket not initialized');
  }
};

/**
 * Listen for order accept success
 * @param {Function} callback - Callback function
 */
export const onOrderAcceptSuccess = (callback) => {
  if (socket) {
    console.log('👂 Registering listener for: order-accept-success');
    socket.on('order-accept-success', (data) => {
      console.log('========================================');
      console.log('✅ ORDER-ACCEPT-SUCCESS EVENT RECEIVED');
      console.log('========================================');
      console.log('Data:', data);
      console.log('Timestamp:', new Date().toISOString());
      console.log('========================================');
      callback(data);
    });
  }
};

/**
 * Listen for delivery boy assigned
 * @param {Function} callback - Callback function
 */
export const onDeliveryAssigned = (callback) => {
  if (socket) {
    console.log('👂 Registering listener for: delivery-assigned');
    socket.on('delivery-assigned', (data) => {
      console.log('========================================');
      console.log('🛵 DELIVERY-ASSIGNED EVENT RECEIVED');
      console.log('========================================');
      console.log('Data:', data);
      console.log('Timestamp:', new Date().toISOString());
      console.log('========================================');
      callback(data);
    });
  }
};

/**
 * Listen for order status updates
 * @param {Function} callback - Callback function
 */
export const onOrderStatus = (callback) => {
  if (socket) {
    console.log('👂 Registering listener for: order-status');
    socket.on('order-status', (data) => {
      console.log('========================================');
      console.log('📦 ORDER-STATUS EVENT RECEIVED');
      console.log('========================================');
      console.log('Data:', data);
      console.log('Timestamp:', new Date().toISOString());
      console.log('========================================');
      callback(data);
    });
  }
};

/**
 * Listen for order delivered
 * @param {Function} callback - Callback function
 */
export const onOrderDelivered = (callback) => {
  if (socket) {
    console.log('👂 Registering listener for: order_delivered');
    socket.on('order_delivered', (data) => {
      console.log('========================================');
      console.log('✅ ORDER-DELIVERED EVENT RECEIVED');
      console.log('========================================');
      console.log('Data:', data);
      console.log('Timestamp:', new Date().toISOString());
      console.log('========================================');
      callback(data);
    });
  }
};

// Cleanup functions
export const offNewOrder = () => {
  if (socket) {
    console.log('🔇 Removing listener for: new-order');
    socket.off('new-order');
  }
};

export const offOrderAcceptSuccess = () => {
  if (socket) {
    console.log('🔇 Removing listener for: order-accept-success');
    socket.off('order-accept-success');
  }
};

export const offDeliveryAssigned = () => {
  if (socket) {
    console.log('🔇 Removing listener for: delivery-assigned');
    socket.off('delivery-assigned');
  }
};

export const offOrderStatus = () => {
  if (socket) {
    console.log('🔇 Removing listener for: order-status');
    socket.off('order-status');
  }
};

export const offOrderDelivered = () => {
  if (socket) {
    console.log('🔇 Removing listener for: order_delivered');
    socket.off('order_delivered');
  }
};

// ==================== CHAT EVENTS ====================

export const joinChatRoom = (conversationId) => {
  if (socket && conversationId) {
    socket.emit('join-chat', conversationId);
    console.log(`Joined chat room: ${conversationId}`);
  }
};

export const leaveChatRoom = (conversationId) => {
  if (socket && conversationId) {
    socket.emit('leave-chat', conversationId);
    console.log(`Left chat room: ${conversationId}`);
  }
};

export const sendChatMessage = (messageData) => {
  if (socket) {
    socket.emit('send-message', messageData);
  }
};

export const onReceiveMessage = (callback) => {
  if (socket) {
    socket.on('receive-message', callback);
  }
};

export const offReceiveMessage = () => {
  if (socket) {
    socket.off('receive-message');
  }
};

