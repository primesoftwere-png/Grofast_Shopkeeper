"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ArrowLeft } from "lucide-react";
import { addCategory } from "@/services/categoryService";

const AddCategory = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    parentCategoryId: null,
    status: "active",
  });

  const icons = [
    "🛒", "🥛", "🍞", "🍎", "🥬", "🥤", "🍿", "🧴",
    "🍕", "🍔", "🍗", "🍖", "🥩", "🐟", "🍤", "🥚",
    "🧀", "🥓", "🥐", "🥖", "🥨", "🥯", "🥞", "🧇",
    "🍌", "🍊", "🍋", "🍇", "🍓", "🫐", "🍒", "🍑",
    "🥕", "🥔", "🧅", "🥒", "🌶️", "🫑", "🥦", "🥬",
    "🍚", "🍜", "🍝", "🥗", "🍲", "🥘", "🍱", "🍛",
    "☕", "🍵", "🧃", "🥤", "🧋", "🍷", "🍺", "🥂",
    "🍰", "🎂", "🧁", "🍪", "🍩", "🍫", "🍬", "🍭",
    "📦", "🏪", "🛍️", "🎁", "💊", "🧼", "🧽", "🧻",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.categoryName.trim()) {
      alert('Please enter category name');
      return;
    }

    try {
      setLoading(true);
      
      // Get user ID from localStorage
      const userStr = localStorage.getItem('user');
      let userId = null;
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userId = user._id || user.id || user.userId;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      
      if (!userId) {
        alert('User not found. Please login again.');
        router.push('/login');
        return;
      }

      const data = {
        categoryName: formData.categoryName,
        description: formData.description,
        parentCategoryId: formData.parentCategoryId || null,
        status: formData.status,
        createdBy: userId,
      };

      const response = await addCategory(data);
      console.log('Add category response:', response);
      
      alert('Category added successfully!');
      router.push('/categories');
    } catch (err) {
      console.error('Error adding category:', err);
      alert(err.message || err.error || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6 max-w-2xl">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Add Category</h1>
              <p className="text-sm text-muted-foreground">
                Create a new product category
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-card border border-border/50 space-y-5">
            {/* Category Name */}
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

            {/* Category Description */}
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

            {/* Status */}
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

            {/* Buttons */}
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
                {loading ? 'Adding...' : 'Add Category'}
              </button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AddCategory;
