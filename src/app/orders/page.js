"use client";
import { toast } from "react-hot-toast";

import React, { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ShoppingCart, Clock, CheckCircle, RotateCcw } from "lucide-react";
import { acceptOrder, markOrderReady, cancelOrder } from "@/services/orderService";
import axiosInstance from "@/lib/axios";
import { initializeSocket, onNewOrder, offNewOrder, onOrderStatus, offOrderStatus, onDeliveryAssigned, offDeliveryAssigned, joinShopkeeperRooms } from "@/services/socketService";

const tabs = [
  { label: "All", status: "ALL", icon: Clock },
  { label: "Pending", status: "PENDING", icon: Clock },
  { label: "Active", status: "ACCEPTED", icon: CheckCircle },
  { label: "Completed", status: "DELIVERED", icon: CheckCircle },
  { label: "Cancelled", status: "CANCELLED", icon: RotateCcw },
];

const statusStyles = {
  PENDING: "bg-secondary text-secondary-foreground",
  ACCEPTED: "bg-info/15 text-info",
  PREPARING: "bg-info/15 text-info",
  READY_FOR_PICKUP: "bg-primary/15 text-primary-dark",
  OUT_FOR_DELIVERY: "bg-info/15 text-info",
  DELIVERED: "bg-primary/15 text-primary-dark",
  CANCELLED: "bg-destructive/10 text-destructive",
  RETURNED: "bg-destructive/10 text-destructive",
};

const getStoredShopkeeperUserId = () => {
  if (typeof window === "undefined") return null;

  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const rawId =
      user?.userId ||
      user?.user?._id ||
      user?.shopkeeper?.userId ||
      user?._id ||
      user?.id;

    if (!rawId) return null;
    if (typeof rawId === "object") return rawId._id || rawId.id || null;
    return rawId;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

const Orders = () => {
  const [activeTab, setActiveTab] = useState("PENDING");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderCounts, setOrderCounts] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const activeTabRef = useRef(activeTab);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Fetch orders from API (used by both tab changes and socket refetch)
  const fetchOrdersSilent = useCallback(async () => {
    try {
      const shopkeeperId = getStoredShopkeeperUserId();
      if (!shopkeeperId) return;

      const currentTab = activeTabRef.current;
      const params = { 
        shopId: shopkeeperId,
        _t: Date.now() // Cache buster
      };
      if (currentTab !== 'ALL') {
        params.status = currentTab;
      }

      const response = await axiosInstance.get('/api/shopkeeper/orders', { params });
      
      // Also silently fetch stats to update counts
      try {
        const statsResponse = await axiosInstance.get('/api/shopkeeper/orders/stats', { params: { shopId: shopkeeperId, _t: Date.now() } });
        if (statsResponse?.data?.data?.orderCounts) {
          setOrderCounts(statsResponse.data.data.orderCounts);
        } else if (statsResponse?.data?.orderCounts) {
          setOrderCounts(statsResponse.data.orderCounts);
        }
      } catch (statsErr) {
        console.error('Silent stats fetch failed:', statsErr);
      }

      let ordersData = [];
      if (response?.data?.recent || response?.data?.history) {
        ordersData = [...(response.data.recent || []), ...(response.data.history || [])];
      } else if (response?.data?.orders && Array.isArray(response.data.orders)) {
        ordersData = response.data.orders;
      } else if (response?.orders && Array.isArray(response.orders)) {
        ordersData = response.orders;
      } else if (Array.isArray(response?.data)) {
        ordersData = response.data;
      } else if (Array.isArray(response)) {
        ordersData = response;
      }
      setOrders(prevOrders => {
        // Create a map of the newly fetched orders
        const fetchedMap = new Map(ordersData.map(o => [(o._id || o.id)?.toString(), o]));
        
        // Keep any optimistic orders (like from sockets) that might not be in the DB yet,
        // if they were created very recently (e.g. less than 1 minute ago)
        const optimisticOrders = prevOrders.filter(o => {
          const id = (o._id || o.id)?.toString();
          if (fetchedMap.has(id)) return false; // It's in the fetched data, we'll use that
          
          // Check if it's a recent optimistic order (within last 60 seconds)
          const createdAt = new Date(o.createdAt).getTime();
          const now = Date.now();
          return (now - createdAt) < 60000; 
        });

        return [...optimisticOrders, ...ordersData];
      });
      return ordersData;
    } catch (err) {
      console.error('Background refetch failed:', err.message || err);
      return null;
    }
  }, []);

  // Initialize socket and listen for new orders
  useEffect(() => {
    console.log('🔌 Initializing socket connection for real-time orders...');
    const socket = initializeSocket();
    
    if (socket) {
      const joinedRooms = joinShopkeeperRooms();
      console.log('Shopkeeper socket rooms:', joinedRooms);

      // Listen for new orders
      onNewOrder((newOrder) => {
        console.log('🔔 NEW ORDER RECEIVED:', newOrder);
        console.log('Order details:', {
          orderId: newOrder.orderId,
          orderNumber: newOrder.orderNumber,
          customerName: newOrder.customerName,
          totalAmount: newOrder.totalAmount,
          items: newOrder.items?.length || 0
        });
        
        // Show browser notification
        try {
          if (typeof window !== 'undefined' && typeof window.Notification !== 'undefined' && window.Notification.permission === 'granted') {
            new window.Notification('🔔 New Order Received!', {
              body: `Order #${newOrder.orderNumber || newOrder.orderId}\nFrom: ${newOrder.customerName || 'Customer'}\nAmount: ₹${newOrder.totalAmount}`,
              icon: '/favicon.ico',
              tag: 'new-order-' + (newOrder.orderId || Date.now()),
              requireInteraction: true,
            });
          }
        } catch (notifErr) {
          console.log('Notification API failed:', notifErr);
        }
        
        // Play notification sound
        try {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(e => console.log('Audio play failed:', e));
        } catch (e) {
          console.log('Audio not available');
        }
        
        // Transform the socket data to match the order structure for instant UI feedback
        const transformedOrder = {
          _id: newOrder.orderId,
          orderNumber: newOrder.orderNumber,
          orderToken: newOrder.orderToken,
          customerId: {
            fullname: newOrder.customerName,
            phone: newOrder.customerPhone
          },
          deliveryAddressId: newOrder.deliveryAddress,
          items: newOrder.items || [],
          totalAmount: newOrder.totalAmount,
          paymentMethod: newOrder.paymentMethod,
          orderStatus: newOrder.status || 'PENDING',
          status: newOrder.status || 'PENDING',
          createdAt: newOrder.createdAt || new Date().toISOString(),
          subtotal: newOrder.items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0,
          deliveryCharge: 0,
          taxAmount: 0,
          discountAmount: 0
        };
        
        const currentTab = activeTabRef.current;

        // Step 1: Immediately add the order to the list for instant UI feedback
        if (currentTab === 'PENDING' || currentTab === 'ALL') {
          console.log('✅ Adding new order to list immediately');
          setOrders(prevOrders => {
            const orderId = transformedOrder._id?.toString();
            const withoutDuplicate = prevOrders.filter(order => (order._id || order.id)?.toString() !== orderId);
            return [transformedOrder, ...withoutDuplicate];
          });
        }

        // Step 2: Fetch silently to ensure all DB fields (like full address objects, product images) are present
        console.log('✅ Instant UI fetch complete via socket, syncing with database...');
        setTimeout(() => {
          fetchOrdersSilent().then((data) => {
            if (data) {
              console.log('✅ Orders refreshed from API:', data.length);
            }
          });
        }, 1000); // 1-second delay to ensure DB write is fully committed
      });

      // Listen for order status updates
      onOrderStatus((data) => {
        console.log('📦 ORDER STATUS UPDATE:', data);
        
        // Update the order in the list if it exists
        setOrders(prevOrders => 
          prevOrders.map(order => 
            (order._id === data.orderId || order.orderToken === data.orderToken)
              ? { ...order, orderStatus: data.status || data.orderStatus, status: data.status || data.orderStatus }
              : order
          )
        );
      });

      // Request notification permission
      if (typeof window !== 'undefined' && typeof window.Notification !== 'undefined' && window.Notification.permission === 'default') {
        window.Notification.requestPermission().then(permission => {
          console.log('Notification permission:', permission);
        });
      }

      // Listen for delivery boy assignment
      onDeliveryAssigned((data) => {
        console.log('🛵 DELIVERY ASSIGNED:', data);
        setOrders(prevOrders => 
          prevOrders.map(order => 
            (order._id === data.orderId || order.orderToken === data.orderToken)
              ? { ...order, deliveryBoy: data.deliveryBoy, status: 'ASSIGNED', orderStatus: 'ASSIGNED' }
              : order
          )
        );
      });
    } else {
      console.error('❌ Socket initialization failed - check authentication token');
    }

    // Cleanup on unmount
    return () => {
      console.log('🔌 Cleaning up socket listeners...');
      offNewOrder();
      offOrderStatus();
      offDeliveryAssigned();
    };
  }, [fetchOrdersSilent]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const shopkeeperId = getStoredShopkeeperUserId();
      
      if (!shopkeeperId) {
        setError('User not found. Please login again.');
        setOrders([]);
        setLoading(false);
        return;
      }

      // Build query params with shopkeeper ID and status
      const params = {
        shopId: shopkeeperId,
        _t: Date.now() // Cache buster
      };
      
      if (activeTab !== 'ALL') {
        params.status = activeTab;
      }

      const response = await axiosInstance.get('/api/shopkeeper/orders', {
        params
      });
      console.log('Orders Response:', response);

      // Fetch order counts
      try {
        const statsResponse = await axiosInstance.get('/api/shopkeeper/orders/stats', {
          params: { shopId: shopkeeperId, _t: Date.now() }
        });
        if (statsResponse?.data?.data?.orderCounts) {
          setOrderCounts(statsResponse.data.data.orderCounts);
        } else if (statsResponse?.data?.orderCounts) {
          setOrderCounts(statsResponse.data.orderCounts);
        }
      } catch (statsErr) {
        console.error('Error fetching order stats:', statsErr);
      }
      
      // Handle different response structures
      let ordersData = [];
      
      if (response?.data?.recent || response?.data?.history) {
        ordersData = [
          ...(response.data.recent || []),
          ...(response.data.history || [])
        ];
      } else if (response?.data?.orders && Array.isArray(response.data.orders)) {
        ordersData = response.data.orders;
      } else if (response?.orders && Array.isArray(response.orders)) {
        ordersData = response.orders;
      } else if (Array.isArray(response?.data)) {
        ordersData = response.data;
      } else if (Array.isArray(response)) {
        ordersData = response;
      }
      
      setOrders(ordersData);
      console.log('Processed orders:', ordersData);
    } catch (err) {
      console.error('Error fetching orders:', err);
      const errorMsg = err.message || err.error || "Failed to load orders. Please check your connection and try again.";
      setError(errorMsg);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Fetch orders on component mount and when tab changes
  useEffect(() => {
    const timeoutId = setTimeout(fetchOrders, 0);
    return () => clearTimeout(timeoutId);
  }, [fetchOrders]);

  const handleAccept = async (order) => {
    try {
      const orderToken = order.orderToken;
      if (!orderToken) {
        showToast('Order token not found', 'error');
        return;
      }

      const response = await acceptOrder(orderToken);
      console.log('Accept order response:', response);
      
      // Show pickup OTP if available
      if (response?.data?.pickupOTP || response?.pickupOTP) {
        const otpObj = response.data?.pickupOTP || response.pickupOTP;
        const otpCode = typeof otpObj === 'object' ? otpObj.code : otpObj;
        showToast(`Order accepted successfully! Pickup OTP: ${otpCode}`);
      } else {
        showToast('Order accepted successfully!');
      }
      
      // Switch to Active tab after accepting
      setActiveTab("ACCEPTED");
      await fetchOrders(); // Refresh list
    } catch (err) {
      console.error('Error accepting order:', err);
      showToast(err.message || err.error || 'Failed to accept order', 'error');
    }
  };

  const handleCancel = async (order) => {
    const reason = prompt('Enter cancellation reason:');
    if (!reason) return;

    try {
      const orderToken = order.orderToken;
      if (!orderToken) {
        toast.error('Order token not found');
        return;
      }

      const response = await cancelOrder(orderToken, reason);
      console.log('Cancel order response:', response);
      toast.success('Order cancelled successfully!');
      await fetchOrders(); // Refresh list
    } catch (err) {
      console.error('Error cancelling order:', err);
      toast.error(err.message || err.error || 'Failed to cancel order');
    }
  };

  const handleMarkReady = async (order) => {
    if (!confirm('Mark this order as ready for pickup?')) return;

    try {
      const orderToken = order.orderToken;
      if (!orderToken) {
        toast.error('Order token not found');
        return;
      }

      const response = await markOrderReady(orderToken);
      console.log('Mark ready response:', response);
      
      // Show pickup OTP if available
      if (response?.data?.pickupOTP || response?.pickupOTP) {
        const otp = response.data?.pickupOTP || response.pickupOTP;
        toast.error(`Order marked as ready!\n\nPickup OTP: ${otp}\n\nShare this OTP with the delivery person.`);
      } else {
        toast.error('Order marked as ready for pickup!');
      }
      
      await fetchOrders(); // Refresh list
    } catch (err) {
      console.error('Error marking order ready:', err);
      toast.error(err.message || err.error || 'Failed to mark order ready');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
      <div className="space-y-6 relative">
        {/* Toast Notification */}
        {toastMessage && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-opacity duration-300 ${
            toastMessage.type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-900 text-white'
          }`}>
            {toastMessage.type !== 'error' && <CheckCircle className="w-5 h-5 text-green-400" />}
            <span className="text-sm font-medium">{toastMessage.message}</span>
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage all incoming orders
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((t) => {
            let count = 0;
            if (orderCounts) {
              if (t.status === "ALL") count = orderCounts.total || 0;
              else if (t.status === "PENDING") count = orderCounts.pending || 0;
              else if (t.status === "ACCEPTED") count = (orderCounts.confirmed || 0) + (orderCounts.assigned || 0) + (orderCounts.pickedUp || 0) + (orderCounts.inTransit || 0);
              else if (t.status === "DELIVERED") count = orderCounts.delivered || 0;
              else if (t.status === "CANCELLED") count = orderCounts.cancelled || 0;
            } else {
              count = activeTab === t.status ? orders.length : 0;
            }

            return (
              <button
                key={t.status}
                onClick={() => setActiveTab(t.status)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === t.status
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted border border-border/50"
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-md ${
                    activeTab === t.status
                      ? "bg-primary-foreground/20"
                      : "bg-muted"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground mt-2">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No orders found</p>
            <p className="text-sm text-muted-foreground mt-1">Orders will appear here when customers place them</p>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o._id || o.id}
                className="bg-card rounded-2xl p-4 shadow-card border border-border/50 space-y-3"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-primary-dark" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {o.orderNumber || o.orderId || o.id}
                        </span>
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                            statusStyles[o.orderStatus || o.status] || "bg-muted text-muted-foreground"
                          }`}
                        >
                          {o.orderStatus || o.status}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mt-1">
                        {o.customerId?.fullname || o.customerName || 'Customer'} · {o.items?.length || o.itemCount || 0} items
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-foreground">₹{o.totalAmount || o.total}</div>
                      <div className="text-xs text-muted-foreground">{o.paymentMethod || 'COD'}</div>
                    </div>
                  </div>
                </div>

                {/* Pickup OTP - Prominent Display */}
                {(o.pickupOTP?.code || o.otp) && (
                  <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">PICKUP OTP</div>
                        <div className="text-3xl font-bold text-primary tracking-wider">{o.pickupOTP?.code || o.otp}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {o.pickupOTP?.message || 'Share this OTP with the delivery person'}
                        </div>
                        {o.pickupOTP?.expiresAt && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Expires: {new Date(o.pickupOTP.expiresAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {(o.pickupOTP?.verified || o.otpVerified) ? (
                          <span className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="text-xs px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground font-medium">
                            Not Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border/50">
                  {/* Customer Info */}
                  <div className="space-y-1 p-3 bg-muted/30 rounded-lg">
                    <div className="text-xs font-semibold text-muted-foreground uppercase">Customer</div>
                    <div className="text-sm font-medium">{o.customerId?.fullname || 'N/A'}</div>
                    <div className="text-xs text-muted-foreground">📞 {o.customerId?.phone || 'N/A'}</div>
                    {o.customerId?.email && (
                      <div className="text-xs text-muted-foreground">✉️ {o.customerId.email}</div>
                    )}
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-1 p-3 bg-muted/30 rounded-lg">
                    <div className="text-xs font-semibold text-muted-foreground uppercase">Delivery Address</div>
                    <div className="text-sm font-medium">{o.deliveryAddressId?.addressType?.toUpperCase() || 'ADDRESS'}</div>
                    <div className="text-sm">{o.deliveryAddressId?.addressLine1 || 'N/A'}</div>
                    {o.deliveryAddressId?.addressLine2 && (
                      <div className="text-sm">{o.deliveryAddressId.addressLine2}</div>
                    )}
                    {o.deliveryAddressId?.landmark && (
                      <div className="text-xs text-muted-foreground">Landmark: {o.deliveryAddressId.landmark}</div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {o.deliveryAddressId?.city}, {o.deliveryAddressId?.state} - {o.deliveryAddressId?.pincode}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 p-3 bg-muted/30 rounded-lg sm:col-span-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase">Order Items</div>
                    {o.items && o.items.length > 0 ? (
                      <div className="space-y-2">
                        {o.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm bg-card p-2 rounded">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.productName}</span>
                              <span className="text-muted-foreground">× {item.quantity}</span>
                              {item.productId?.productImage && (
                                <span className="text-xs text-muted-foreground">(Image available)</span>
                              )}
                            </div>
                            <span className="font-semibold">₹{item.totalPrice}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-2 border-t border-border/50 font-semibold">
                          <span>Subtotal:</span>
                          <span>₹{o.subtotal}</span>
                        </div>
                        {o.deliveryCharge > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span>Delivery Charge:</span>
                            <span>₹{o.deliveryCharge}</span>
                          </div>
                        )}
                        {o.taxAmount > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span>Tax:</span>
                            <span>₹{o.taxAmount}</span>
                          </div>
                        )}
                        {o.discountAmount > 0 && (
                          <div className="flex items-center justify-between text-sm text-primary">
                            <span>Discount:</span>
                            <span>-₹{o.discountAmount}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-border/50 font-bold text-lg">
                          <span>Total Amount:</span>
                          <span className="text-primary">₹{o.totalAmount}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No items</div>
                    )}
                  </div>

                  {/* Payment & Special Instructions */}
                  <div className="space-y-2 p-3 bg-muted/30 rounded-lg sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase">Payment</div>
                        <div className="text-sm font-medium">{o.paymentMethod} - {o.paymentStatus}</div>
                        {o.codAmount > 0 && (
                          <div className="text-xs text-muted-foreground">COD Amount: ₹{o.codAmount}</div>
                        )}
                      </div>
                      {o.estimatedDeliveryTime && (
                        <div className="text-right">
                          <div className="text-xs font-semibold text-muted-foreground uppercase">Est. Delivery</div>
                          <div className="text-xs">{new Date(o.estimatedDeliveryTime).toLocaleString()}</div>
                        </div>
                      )}
                    </div>
                    {o.specialInstructions && (
                      <div className="pt-2 border-t border-border/50">
                        <div className="text-xs font-semibold text-muted-foreground uppercase">Special Instructions</div>
                        <div className="text-sm mt-1">{o.specialInstructions}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Timing */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground">
                  <div>
                    Ordered: {o.createdAt ? new Date(o.createdAt).toLocaleString() : 'N/A'}
                  </div>
                  {o.acceptedAt && (
                    <div>
                      Accepted: {new Date(o.acceptedAt).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-border/50">
                  {(o.orderStatus === 'PENDING' || o.status === 'PENDING') && (
                    <>
                      <button
                        onClick={() => handleAccept(o)}
                        className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                      >
                        Accept Order
                      </button>
                      <button
                        onClick={() => handleCancel(o)}
                        className="h-10 px-4 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  {(o.orderStatus === 'ACCEPTED' || o.orderStatus === 'PREPARING' || o.status === 'ACCEPTED' || o.status === 'PREPARING') && (
                    <button
                      onClick={() => handleMarkReady(o)}
                      className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                    >
                      Mark Ready for Pickup
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Orders;
