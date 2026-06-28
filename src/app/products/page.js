"use client";
import { toast } from "react-hot-toast";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Plus, Search, Edit, Trash2, Filter, ChevronLeft, ChevronRight, X } from "lucide-react";
import { getAllProducts, deleteProduct } from "@/services/productService";
import { getAllCategories } from "@/services/categoryService";

const Products = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Fetch products on component mount and when filters change
  useEffect(() => {
    fetchProducts();
  }, [pagination.currentPage, filters.sortBy, filters.sortOrder]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      const categoriesData = response?.categories || response?.data || response || [];
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Build query params
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
      };

      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;

      const response = await getAllProducts(params);
      console.log('Products Response:', response);
      
      // Handle different response structures
      let productsData = [];
      let paginationData = null;
      
      if (response?.data?.products && Array.isArray(response.data.products)) {
        productsData = response.data.products;
        paginationData = response.data.pagination;
      } else if (response?.products && Array.isArray(response.products)) {
        productsData = response.products;
        paginationData = response.pagination;
      } else if (Array.isArray(response?.data)) {
        productsData = response.data;
      } else if (Array.isArray(response)) {
        productsData = response;
      }
      
      setProducts(productsData);
      
      // Update pagination if available
      if (paginationData) {
        setPagination(prev => ({
          ...prev,
          ...paginationData,
        }));
      }
      
      console.log('Processed products:', productsData);
      console.log('Pagination:', paginationData);
    } catch (err) {
      console.error('Error fetching products:', err);
      const errorMsg = err.message || err.error || "Failed to load products. Please check your connection and try again.";
      setError(errorMsg);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await deleteProduct(productId);
      console.log('Delete product response:', response);
      toast.success('Product deleted successfully!');
      await fetchProducts(); // Refresh list
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error(err.message || err.error || 'Failed to delete product');
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchProducts();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchProducts();
  };

  const removeFilter = (filterName) => {
    const newFilters = { ...filters };
    if (filterName === 'search') newFilters.search = '';
    if (filterName === 'category') newFilters.category = '';
    if (filterName === 'minPrice') newFilters.minPrice = '';
    if (filterName === 'maxPrice') newFilters.maxPrice = '';
    if (filterName === 'priceRange') {
      newFilters.minPrice = '';
      newFilters.maxPrice = '';
    }
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Get active filters for badges
  const getActiveFilters = () => {
    const active = [];
    if (filters.search) active.push({ name: 'search', label: `Search: ${filters.search}`, value: filters.search });
    if (filters.category) {
      const cat = categories.find(c => c._id === filters.category);
      active.push({ name: 'category', label: `Category: ${cat?.categoryName || 'Unknown'}`, value: filters.category });
    }
    if (filters.minPrice || filters.maxPrice) {
      const priceLabel = filters.minPrice && filters.maxPrice 
        ? `₹${filters.minPrice} - ₹${filters.maxPrice}`
        : filters.minPrice 
        ? `Min: ₹${filters.minPrice}`
        : `Max: ₹${filters.maxPrice}`;
      active.push({ name: 'priceRange', label: `Price: ${priceLabel}`, value: true });
    }
    return active;
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Products</h1>
            <p className="text-sm text-muted-foreground">
              {pagination.total > 0 ? `${pagination.total} products in catalog` : 'No products yet'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-muted hover:bg-muted/80 text-foreground rounded-xl h-10 px-4 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            
            <button 
              onClick={() => router.push('/products/add')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10 px-4 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Product name or code"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.categoryName || cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Min Price (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Max Price (₹)
                </label>
                <input
                  type="number"
                  placeholder="1000"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none"
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none"
                >
                  <option value="createdAt">Date Added</option>
                  <option value="productName">Name</option>
                  <option value="productPrice">Price</option>
                  <option value="productQuantity">Stock</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Order
                </label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                className="flex-1 h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="h-10 px-4 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Quick Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Quick search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            className="w-full pl-9 h-10 rounded-xl bg-muted border-none text-sm outline-none"
          />
        </div>

        {/* Active Filters */}
        {getActiveFilters().length > 0 && (
          <div className="flex flex-wrap gap-2">
            {getActiveFilters().map((filter) => (
              <div
                key={filter.name}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary-dark rounded-lg text-sm"
              >
                <span>{filter.label}</span>
                <button
                  onClick={() => removeFilter(filter.name)}
                  className="hover:bg-primary/20 rounded p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground mt-2">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-muted-foreground">
              {filters.search || filters.category ? 'No products found matching your filters' : 'No products in catalog'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {filters.search || filters.category ? 'Try adjusting your filters' : 'Add your first product to get started'}
            </p>
          </div>
        ) : (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div
                  key={p._id || p.id}
                  className="bg-card rounded-2xl p-4 shadow-card border border-border/50 hover:shadow-elevated transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                      {p.productImage ? (
                        <img 
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://172.20.10.5:8000'}/uploads/${p.productImage}`} 
                          alt={p.productName}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.textContent = '📦';
                          }}
                        />
                      ) : '📦'}
                    </div>

                    <div className="flex gap-1">
                      <button 
                        onClick={() => router.push(`/products/edit/${p._id || p.id}`)}
                        className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button 
                        onClick={() => handleDelete(p._id || p.id)}
                        className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-foreground mt-3">
                    {p.productName || p.name}
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    {p.productCategory?.categoryName || 'Uncategorized'}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-foreground">
                      ₹{p.productPrice || p.price}
                    </span>

                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
                        (p.productQuantity || p.stock || 0) <= 5
                          ? "bg-destructive/10 text-destructive"
                          : "bg-primary/10 text-primary-dark"
                      }`}
                    >
                      Stock: {p.productQuantity || p.stock || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-card rounded-2xl p-4 shadow-card border border-border/50">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.currentPage} of {pagination.totalPages} ({pagination.total} total)
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="w-10 h-10 rounded-xl bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {[...Array(pagination.totalPages)].map((_, index) => {
                      const pageNum = index + 1;
                      // Show first, last, current, and adjacent pages
                      if (
                        pageNum === 1 ||
                        pageNum === pagination.totalPages ||
                        (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-xl font-medium ${
                              pageNum === pagination.currentPage
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === pagination.currentPage - 2 ||
                        pageNum === pagination.currentPage + 2
                      ) {
                        return <span key={pageNum} className="w-10 h-10 flex items-center justify-center">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="w-10 h-10 rounded-xl bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Products;
