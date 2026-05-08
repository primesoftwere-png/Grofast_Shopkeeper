"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Package, AlertTriangle, TrendingDown } from "lucide-react";
import { getInventory, getLowStockProducts, getOutOfStockProducts } from "@/services/inventoryService";

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);

      // Fetch all inventory
      const inventoryResponse = await getInventory();
      console.log('Inventory Response:', inventoryResponse);
      
      // Fetch low stock products
      const lowStockResponse = await getLowStockProducts(10);
      console.log('Low Stock Response:', lowStockResponse);
      
      // Fetch out of stock products
      const outOfStockResponse = await getOutOfStockProducts();
      console.log('Out of Stock Response:', outOfStockResponse);

      setInventory(inventoryResponse?.products || inventoryResponse?.data || []);
      setLowStock(lowStockResponse?.products || lowStockResponse?.data || []);
      setOutOfStock(outOfStockResponse?.products || outOfStockResponse?.data || []);
      setError("");
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your inventory and stock levels here.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-dark" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Products</p>
                <h3 className="text-xl font-bold text-foreground">
                  {loading ? "..." : inventory.length}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Low Stock</p>
                <h3 className="text-xl font-bold text-foreground">
                  {loading ? "..." : lowStock.length}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Out of Stock</p>
                <h3 className="text-xl font-bold text-foreground">
                  {loading ? "..." : outOfStock.length}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground mt-2">Loading inventory...</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
            <h3 className="font-semibold text-foreground mb-4">Inventory Overview</h3>
            <p className="text-sm text-muted-foreground">
              {inventory.length > 0 
                ? `Showing ${inventory.length} products in inventory`
                : "No inventory data available. Add products to see them here."}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
