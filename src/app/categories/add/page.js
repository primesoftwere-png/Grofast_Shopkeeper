"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ArrowLeft, X } from "lucide-react";
import { addCategory, getAllCategories } from "@/services/categoryService";

const AddCategory = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState([]);
  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    categoryType: "parent",
    parentCategoryId: "",
    status: "active",
    categoryImage: null,
  });
  const [imagePreview, setImagePreview] = useState(null);



  useEffect(() => {
    fetchParentCategories();
  }, []);

  const fetchParentCategories = async () => {
    try {
      const response = await getAllCategories({ parentOnly: true, limit: 100 });
      let categoriesData = [];
      if (response?.data?.categories && Array.isArray(response.data.categories)) {
        categoriesData = response.data.categories;
      } else if (response?.categories && Array.isArray(response.categories)) {
        categoriesData = response.categories;
      } else if (Array.isArray(response?.data)) {
        categoriesData = response.data;
      } else if (Array.isArray(response)) {
        categoriesData = response;
      }
      
      // Strictly ensure only active parent categories are shown in the dropdown
      const validParents = categoriesData.filter(c => 
        c.categoryType === 'parent' && c.status === 'active'
      );
      
      setParentCategories(validParents);
    } catch (err) {
      console.error('Error fetching parent categories:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        categoryImage: file
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, categoryImage: null }));
    setImagePreview(null);
    const fileInput = document.getElementById('categoryImageInput');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.categoryName.trim()) {
      alert('Please enter category name');
      return;
    }
    
    if (formData.categoryType === 'child' && !formData.parentCategoryId) {
      alert('Please select a parent category');
      return;
    }

    if (!formData.categoryImage) {
      alert('Please select a category image');
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

      const submitData = new FormData();
      submitData.append('categoryName', formData.categoryName);
      if (formData.description) submitData.append('description', formData.description);
      submitData.append('categoryType', formData.categoryType);
      submitData.append('status', formData.status);
      submitData.append('createdBy', userId);

      if (formData.categoryType === 'child') {
        submitData.append('parentCategoryId', formData.parentCategoryId);
      }
      if (formData.categoryImage) {
        submitData.append('categoryImage', formData.categoryImage);
      }

      const response = await addCategory(submitData);
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

            {/* Category Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="categoryType"
                    value="parent"
                    checked={formData.categoryType === 'parent'}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Parent Category</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="categoryType"
                    value="child"
                    checked={formData.categoryType === 'child'}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Child Category</span>
                </label>
              </div>
            </div>

            {/* Parent Category Dropdown (Conditional) */}
            {formData.categoryType === 'child' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Parent Category <span className="text-destructive">*</span>
                </label>
                <select
                  name="parentCategoryId"
                  value={formData.parentCategoryId}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary"
                  required={formData.categoryType === 'child'}
                >
                  <option value="">Select Parent Category</option>
                  {parentCategories.map(cat => (
                    <option key={cat._id || cat.id} value={cat._id || cat.id}>
                      {cat.categoryName || cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category Image Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category Image <span className="text-destructive">*</span>
              </label>
              
              {imagePreview && (
                <div className="mb-4 relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Category Preview"
                    className="w-24 h-24 object-cover rounded-xl border border-border bg-white"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm hover:bg-destructive/90"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <input
                id="categoryImageInput"
                type="file"
                name="categoryImage"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full h-10 px-3 py-2 rounded-xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
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
