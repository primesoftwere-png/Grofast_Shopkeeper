"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ArrowLeft, Upload, X } from "lucide-react";
import { getProductById, updateProduct } from "@/services/productService";
import { getAllCategories } from "@/services/categoryService";

const EditProduct = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;
  
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(true);
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    productCode: "",
    productName: "",
    productDescription: "",
    productPrice: "",
    productQuantity: "",
    productCategory: "",
    productUnit: "kg",
    productImage: null,
  });

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [productId]);

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      console.log('Categories Response:', response);
      
      // Handle different response structures
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
      
      setCategories(categoriesData);
      console.log('Processed categories:', categoriesData);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  const fetchProduct = async () => {
    try {
      setFetchingProduct(true);
      const response = await getProductById(productId);
      console.log('Product Response:', response);
      
      // Handle different response structures
      let product = null;
      
      if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        product = response.data;
      } else if (response?.product && typeof response.product === 'object') {
        product = response.product;
      } else if (response && typeof response === 'object' && response._id) {
        product = response;
      }
      
      if (product) {
        setFormData({
          productCode: product.productCode || "",
          productName: product.productName || "",
          productDescription: product.productDescription || "",
          productPrice: product.productPrice || "",
          productQuantity: product.productQuantity || "",
          productCategory: product.productCategory?._id || product.productCategory || "",
          productUnit: product.productUnit || "kg",
          productImage: null,
        });
        
        // Set image preview if exists
        if (product.productImage) {
          setImagePreview(`http://172.20.10.5:8000/uploads/${product.productImage}`);
        }
      } else {
        throw new Error('Product data not found in response');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      alert('Failed to load product details');
      router.push('/products');
    } finally {
      setFetchingProduct(false);
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
        productImage: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      productImage: null
    }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.productName.trim()) {
      alert('Please enter product name');
      return;
    }
    if (!formData.productDescription.trim()) {
      alert('Please enter product description');
      return;
    }
    if (!formData.productPrice || formData.productPrice <= 0) {
      alert('Please enter valid price');
      return;
    }
    if (!formData.productQuantity || formData.productQuantity < 0) {
      alert('Please enter valid quantity');
      return;
    }

    try {
      setLoading(true);
      
      const data = new FormData();
      if (formData.productCode) data.append('productCode', formData.productCode);
      data.append('productName', formData.productName);
      data.append('productDescription', formData.productDescription);
      data.append('productPrice', formData.productPrice);
      data.append('productQuantity', formData.productQuantity);
      data.append('productUnit', formData.productUnit);
      
      if (formData.productCategory) {
        data.append('productCategory', formData.productCategory);
      }
      
      if (formData.productImage) {
        data.append('productImage', formData.productImage);
      }

      const response = await updateProduct(productId, data);
      console.log('Update product response:', response);
      
      alert('Product updated successfully!');
      router.push('/products');
    } catch (err) {
      console.error('Error updating product:', err);
      alert(err.message || err.error || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProduct) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground mt-2">Loading product...</p>
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
              <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
              <p className="text-sm text-muted-foreground">
                Update product information
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-card border border-border/50 space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Product Image
              </label>
              
              {imagePreview ? (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-muted">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="w-32 h-32 rounded-xl border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center bg-muted/50 hover:bg-muted transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Product Code
              </label>
              <input
                type="text"
                name="productCode"
                value={formData.productCode}
                onChange={handleChange}
                placeholder="e.g., PROD001"
                className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Product Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description <span className="text-destructive">*</span>
              </label>
              <textarea
                name="productDescription"
                value={formData.productDescription}
                onChange={handleChange}
                placeholder="Enter product description"
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category
              </label>
              <select
                name="productCategory"
                value={formData.productCategory}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.categoryName || cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Price (₹) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  name="productPrice"
                  value={formData.productPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Quantity <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  name="productQuantity"
                  value={formData.productQuantity}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Unit <span className="text-destructive">*</span>
              </label>
              <select
                name="productUnit"
                value={formData.productUnit}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="gram">Gram (g)</option>
                <option value="liter">Liter (L)</option>
                <option value="ml">Milliliter (ml)</option>
                <option value="piece">Piece</option>
                <option value="packet">Packet</option>
                <option value="bottle">Bottle</option>
                <option value="box">Box</option>
                <option value="dozen">Dozen</option>
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
                {loading ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default EditProduct;
