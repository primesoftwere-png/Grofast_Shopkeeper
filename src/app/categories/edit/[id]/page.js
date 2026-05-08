"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ArrowLeft } from "lucide-react";
import { getCategoryById, updateCategory } from "@/services/categoryService";

const EditCategory = () => {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id;
  
  const [loading, setLoading] = useState(false);
  const [fetchingCategory, setFetchingCategory] = useState(true);
  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    status: "active",
  });

  useEffect(() => {
    fetchCategory();
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      setFetchingCategory(true);
      const response = await getCategoryById(categoryId);
      console.log('Category Response:', response);
      
      // Handle different response structures
      let category = null;
      
      if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        category = response.data;
      } else if (response?.category && typeof response.category === 'object') {
        category = response.category;
      } else if (response && typeof response === 'object' && response._id) {
        category = response;
      }
      
      if (category) {
        setFormData({
          categoryName: category.categoryName || "",
          description: category.description || "",
          status: category.status || "active",
        });
      } else {
        throw new Error('Category data not found in response');
      }
    } catch (err) {
      console.error('Error fetching category:', err);
      alert('Failed to load category details');
      router.push('/categories');
    } finally {
      setFetchingCategory(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.categoryName.trim()) {
      alert('Please enter category name');
      return;
    }

    try {
      setLoading(true);
      
      const data = {
        categoryName: formData.categoryName,
        description: formData.description,
        status: formData.status,
      };

      const response = await updateCategory(categoryId, data);
      console.log('Update category response:', response);
      
      alert('Category updated successfully!');
      router.push('/categories');
    } catch (err) {
      console.error('Error updating category:', err);
      alert(err.message || err.error || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCategory) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground mt-2">Loading category...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6 max-w-2xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Edit Category</h1>
              <p className="text-sm text-muted-foreground">
                Update category information
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-card border border-border/50 space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="categoryName"
                value={formData.categoryName}
                onChange={handleChange}
                placeholder="Enter category name"
                className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter category description"
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 h-10 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Category'}
              </button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default EditCategory;
