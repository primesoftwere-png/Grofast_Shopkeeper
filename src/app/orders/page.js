"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ShoppingCart, Clock, CheckCircle, RotateCcw } from "lucide-react";
import { getOrders, acceptOrder, markOrderReady, cancelOrder } from "@/services/orderService";

const tabs = [
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

const Orders = () => {
  const [activeTab, setActiveTab] = useState("PENDING");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch orders on component mount and when tab changes
  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Get shopkeeper ID from localStorage
      const userStr = localStorage.getItem('user');
      let shopkeeperId = null;
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          shopkeeperId = user._id || user.id || user.userId;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      
      if (!shopkeeperId) {
        setError('User not found. Please login again.');
        setOrders([]);
        setLoading(false);
        return;
      }

      // Build query params with shopkeeper ID and status
      const params = {
        status: activeTab,
        shopId: shopkeeperId,
      };

      const response = await getOrders(params);
      console.log('Orders Response:', response);
      
      // Handle different response structures
      let ordersData = [];
      
      if (response?.data?.orders && Array.isArray(response.data.orders)) {
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
  };

  const handleAccept = async (order) => {
    try {
      const orderToken = order.orderToken;
      if (!orderToken) {
        alert('Order token not found');
        return;
      }

      const response = await acceptOrder(orderToken);
      console.log('Accept order response:', response);
      
      // Show pickup OTP if available
      if (response?.data?.pickupOTP || response?.pickupOTP) {
        const otp = response.data?.pickupOTP || response.pickupOTP;
        alert(`Order accepted successfully!\n\nPickup OTP: ${otp}\n\nShare this OTP with the delivery person.`);
      } else {
        alert('Order accepted successfully!');
      }
      
      // Switch to Active tab after accepting
      setActiveTab("ACCEPTED");
      await fetchOrders(); // Refresh list
    } catch (err) {
      console.error('Error accepting order:', err);
      alert(err.message || err.error || 'Failed to accept order');
    }
  };

  const handleCancel = async (order) => {
    const reason = prompt('Enter cancellation reason:');
    if (!reason) return;

    try {
      const orderToken = order.orderToken;
      if (!orderToken) {
        alert('Order token not found');
        return;
      }

      const response = await cancelOrder(orderToken, reason);
      console.log('Cancel order response:', response);
      alert('Order cancelled successfully!');
      await fetchOrders(); // Refresh list
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(err.message || err.error || 'Failed to cancel order');
    }
  };

  const handleMarkReady = async (order) => {
    if (!confirm('Mark this order as ready for pickup?')) return;

    try {
      const orderToken = order.orderToken;
      if (!orderToken) {
        alert('Order token not found');
        return;
      }

      const response = await markOrderReady(orderToken);
      console.log('Mark ready response:', response);
      
      // Show pickup OTP if available
      if (response?.data?.pickupOTP || response?.pickupOTP) {
        const otp = response.data?.pickupOTP || response.pickupOTP;
        alert(`Order marked as ready!\n\nPickup OTP: ${otp}\n\nShare this OTP with the delivery person.`);
      } else {
        alert('Order marked as ready for pickup!');
      }
      
      await fetchOrders(); // Refresh list
    } catch (err) {
      console.error('Error marking order ready:', err);
      alert(err.message || err.error || 'Failed to mark order ready');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
      <div className="space-y-6">
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
          {tabs.map((t) => (
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
                {orders.length}
              </span>
            </button>
          ))}
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
                {o.pickupOTP && o.pickupOTP.code && (
                  <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">PICKUP OTP</div>
                        <div className="text-3xl font-bold text-primary tracking-wider">{o.pickupOTP.code}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {o.pickupOTP.message || 'Share this OTP with the delivery person'}
                        </div>
                        {o.pickupOTP.expiresAt && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Expires: {new Date(o.pickupOTP.expiresAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {o.pickupOTP.verified ? (
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
