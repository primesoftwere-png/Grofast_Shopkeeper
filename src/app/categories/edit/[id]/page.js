"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ArrowLeft, X } from "lucide-react";
import { getCategoryById, updateCategory, getAllCategories } from "@/services/categoryService";

const EditCategory = () => {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id;
  
  const [loading, setLoading] = useState(false);
  const [fetchingCategory, setFetchingCategory] = useState(true);
  const [parentCategories, setParentCategories] = useState([]);
  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    categoryType: "parent",
    parentCategoryId: "",
    status: "active",
    categoryImage: null,
    existingImage: null,
    removeImage: false,
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchParentCategories();
    fetchCategory();
  }, [categoryId]);

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
      
      // Strictly ensure only active parent categories are shown, excluding itself
      const validParents = categoriesData.filter(c => 
        c.categoryType === 'parent' && 
        c.status === 'active' && 
        (c._id || c.id) !== categoryId
      );
      
      setParentCategories(validParents);
    } catch (err) {
      console.error('Error fetching parent categories:', err);
    }
  };

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
        let pId = "";
        if (category.parentCategoryId) {
          pId = typeof category.parentCategoryId === 'object' 
                ? category.parentCategoryId._id 
                : category.parentCategoryId;
        }

        setFormData({
          categoryName: category.categoryName || "",
          description: category.description || "",
          categoryType: category.categoryType || (pId ? "child" : "parent"),
          parentCategoryId: pId,
          status: category.status || "active",
          categoryImage: null,
          existingImage: category.categoryImage || null,
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
    setFormData(prev => ({ ...prev, categoryImage: null, existingImage: null, removeImage: true }));
    setImagePreview(null);
    const fileInput = document.getElementById('categoryImageInput');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.categoryName.trim()) {
      alert('Please enter category name');
      return;
    }

    if (formData.categoryType === 'child' && !formData.parentCategoryId) {
      alert('Please select a parent category');
      return;
    }

    if (!formData.categoryImage && !formData.existingImage) {
      alert('Category image is required');
      return;
    }

    try {
      setLoading(true);
      
      const submitData = new FormData();
      submitData.append('categoryName', formData.categoryName);
      if (formData.description) submitData.append('description', formData.description);
      submitData.append('categoryType', formData.categoryType);
      submitData.append('status', formData.status);

      if (formData.categoryType === 'child') {
        submitData.append('parentCategoryId', formData.parentCategoryId);
      } else {
        submitData.append('parentCategoryId', ''); // Clear if parent
      }
      
      if (formData.categoryImage) {
        submitData.append('categoryImage', formData.categoryImage);
      } else if (formData.removeImage) {
        submitData.append('removeImage', 'true');
      }

      const response = await updateCategory(categoryId, submitData);
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
                <label className="flex items-center gap-2 cursor-not-allowed opacity-70">
                  <input
                    type="radio"
                    name="categoryType"
                    value="parent"
                    checked={formData.categoryType === 'parent'}
                    disabled
                    className="w-4 h-4 text-primary focus:ring-primary cursor-not-allowed"
                  />
                  <span className="text-sm">Parent Category</span>
                </label>
                <label className="flex items-center gap-2 cursor-not-allowed opacity-70">
                  <input
                    type="radio"
                    name="categoryType"
                    value="child"
                    checked={formData.categoryType === 'child'}
                    disabled
                    className="w-4 h-4 text-primary focus:ring-primary cursor-not-allowed"
                  />
                  <span className="text-sm">Child Category</span>
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Category type cannot be changed after creation.
              </p>
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
              {(imagePreview || formData.existingImage) && (
                <div className="mb-4 relative inline-block">
                  <img
                    src={imagePreview || (formData.existingImage.startsWith('http') ? formData.existingImage : `${process.env.NEXT_PUBLIC_IMAGE_URL || 'http://172.20.10.5:8000'}/uploads/${formData.existingImage}`)}
                    alt="Category Preview"
                    className="w-24 h-24 object-cover rounded-xl border border-border bg-white"
                    onError={(e) => { e.target.style.display = 'none'; }}
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
