"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Plus, Edit, Trash2, Filter, ChevronLeft, ChevronRight, X } from "lucide-react";
import { getAllCategories, deleteCategory } from "@/services/categoryService";

const Categories = () => {
  const router = useRouter();
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
    status: "active",
    parentOnly: false,
    sortBy: "categoryName",
    sortOrder: "asc",
  });

  // Fetch categories on component mount and when filters change
  useEffect(() => {
    fetchCategories();
  }, [pagination.currentPage, filters.sortBy, filters.sortOrder]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Build query params
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
      };

      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.parentOnly) params.parentOnly = filters.parentOnly;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;

      const response = await getAllCategories(params);
      console.log('Categories Response:', response);
      
      // Handle different response structures
      let categoriesData = [];
      let paginationData = null;
      
      if (response?.data?.categories && Array.isArray(response.data.categories)) {
        categoriesData = response.data.categories;
        paginationData = response.data.pagination;
      } else if (response?.categories && Array.isArray(response.categories)) {
        categoriesData = response.categories;
        paginationData = response.pagination;
      } else if (Array.isArray(response?.data)) {
        categoriesData = response.data;
      } else if (Array.isArray(response)) {
        categoriesData = response;
      }
      
      setCategories(categoriesData);
      
      // Update pagination if available
      if (paginationData) {
        setPagination(prev => ({
          ...prev,
          ...paginationData,
        }));
      }
      
      console.log('Processed categories:', categoriesData);
      console.log('Pagination:', paginationData);
    } catch (err) {
      console.error('Error fetching categories:', err);
      const errorMsg = err.message || err.error || "Failed to load categories. Please check your connection and try again.";
      setError(errorMsg);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await deleteCategory(categoryId);
      console.log('Delete category response:', response);
      alert('Category deleted successfully!');
      await fetchCategories(); // Refresh list
    } catch (err) {
      console.error('Error deleting category:', err);
      alert(err.message || err.error || 'Failed to delete category');
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
    fetchCategories();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "active",
      parentOnly: false,
      sortBy: "categoryName",
      sortOrder: "asc",
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchCategories();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const removeFilter = (filterName) => {
    const newFilters = { ...filters };
    if (filterName === 'search') newFilters.search = '';
    if (filterName === 'status') newFilters.status = 'active';
    if (filterName === 'parentOnly') newFilters.parentOnly = false;
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Get active filters for badges
  const getActiveFilters = () => {
    const active = [];
    if (filters.search) active.push({ name: 'search', label: `Search: ${filters.search}`, value: filters.search });
    if (filters.status && filters.status !== 'active') active.push({ name: 'status', label: `Status: ${filters.status}`, value: filters.status });
    if (filters.parentOnly) active.push({ name: 'parentOnly', label: 'Parent Only', value: true });
    return active;
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Categories</h1>
            <p className="text-sm text-muted-foreground">
              {pagination.total > 0 ? `${pagination.total} categories` : 'No categories yet'}
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
              onClick={() => router.push('/categories/add')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10 px-4 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Category
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
                  placeholder="Category name"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="">All Status</option>
                </select>
              </div>

              {/* Parent Only */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category Type
                </label>
                <select
                  value={filters.parentOnly ? 'parent' : 'all'}
                  onChange={(e) => handleFilterChange('parentOnly', e.target.value === 'parent')}
                  className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="parent">Parent Only</option>
                </select>
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
                  <option value="categoryName">Name</option>
                  <option value="createdAt">Date Added</option>
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
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
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
                  <X className="w-3 h-3" />
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
            <p className="text-muted-foreground mt-2">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
            <div className="text-4xl mb-3">📂</div>
            <p className="text-muted-foreground">
              {filters.search || filters.status !== 'active' ? 'No categories found matching your filters' : 'No categories found'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {filters.search || filters.status !== 'active' ? 'Try adjusting your filters' : 'Add your first category to organize products'}
            </p>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((c) => {
                const isChild = c.categoryType === 'child' || !!c.parentCategoryId;
                
                return (
                <div
                  key={c._id || c.id}
                  className="bg-card rounded-2xl p-5 shadow-card border border-border/50 hover:shadow-elevated transition-shadow text-center relative"
                >
                  {/* Category Type Badge */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${isChild ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {isChild ? 'Child' : 'Parent'}
                    </span>
                  </div>

                  <div className="flex justify-center mb-3 mt-4">
                    {c.categoryImage ? (
                      <img 
                        src={c.categoryImage.startsWith('http') ? c.categoryImage : `${process.env.NEXT_PUBLIC_IMAGE_URL || 'http://172.20.10.5:8000'}/uploads/${c.categoryImage}`}
                        alt={c.categoryName || c.name || 'Category'}
                        className="w-16 h-16 object-cover rounded-xl shadow-sm border border-border bg-white"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-16 h-16 rounded-xl bg-muted items-center justify-center text-3xl shadow-sm border border-border ${c.categoryImage ? 'hidden' : 'flex'}`}
                    >
                      {c.icon || c.categoryIcon || '📦'}
                    </div>
                  </div>

                  <h3 className="font-semibold text-foreground">{c.categoryName || c.name}</h3>

                  {/* Parent name if child */}
                  {isChild && c.parentCategoryId && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      in {typeof c.parentCategoryId === 'object' ? c.parentCategoryId.categoryName : 'Parent Category'}
                    </p>
                  )}

                  <p className="text-sm text-muted-foreground mt-1">
                    {c.productCount !== undefined ? `${c.productCount} products` : '0 products'}
                  </p>

                  {/* Status Badge */}
                  {c.status && c.status !== 'active' && (
                    <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-lg ${
                      c.status === 'inactive' ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {c.status}
                    </span>
                  )}

                  {/* Actions */}
                  <div className="flex justify-center gap-2 mt-3">
                    <button 
                      onClick={() => router.push(`/categories/edit/${c._id || c.id}`)}
                      className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button 
                      onClick={() => handleDelete(c._id || c.id)}
                      className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                );
              })}
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

export default Categories;
