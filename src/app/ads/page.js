"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Plus, Edit, Trash2, X, Image as ImageIcon } from "lucide-react";
import { getAdvertisements, createAdvertisement, updateAdvertisement, deleteAdvertisement } from "@/services/advertisementService";

const AdsPage = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [currentAd, setCurrentAd] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    type: "banner",
    targetUrl: "",
    validFrom: "",
    validUntil: "",
    status: "active",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdvertisements();
      let adsData = [];
      if (response?.data?.data) {
        adsData = response.data.data;
      } else if (response?.data) {
        adsData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        adsData = response;
      }
      setAds(adsData);
    } catch (err) {
      console.error('Error fetching ads:', err);
      setError(err.message || err.error || "Failed to load advertisements.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, ad = null) => {
    setModalMode(mode);
    setCurrentAd(ad);
    if (mode === "edit" && ad) {
      setFormData({
        title: ad.title || "",
        type: ad.type || "banner",
        targetUrl: ad.targetUrl || "",
        validFrom: ad.validFrom ? new Date(ad.validFrom).toISOString().split('T')[0] : "",
        validUntil: ad.validUntil ? new Date(ad.validUntil).toISOString().split('T')[0] : "",
        status: ad.status || "active",
        image: null,
      });
      if (ad.image) {
        setImagePreview(`${process.env.NEXT_PUBLIC_API_URL || 'http://172.20.10.5:8000'}/uploads/${ad.image}`);
      } else {
        setImagePreview("");
      }
    } else {
      setFormData({
        title: "",
        type: "banner",
        targetUrl: "",
        validFrom: "",
        validUntil: "",
        status: "active",
        image: null,
      });
      setImagePreview("");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentAd(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append("title", formData.title);
      data.append("type", formData.type);
      data.append("targetUrl", formData.targetUrl);
      if (formData.validFrom) data.append("validFrom", formData.validFrom);
      if (formData.validUntil) data.append("validUntil", formData.validUntil);
      data.append("status", formData.status);
      
      if (formData.image) {
        data.append("image", formData.image);
      }

      if (modalMode === "add") {
        await createAdvertisement(data);
        alert("Advertisement created successfully!");
      } else {
        await updateAdvertisement(currentAd._id || currentAd.id, data);
        alert("Advertisement updated successfully!");
      }
      handleCloseModal();
      fetchAds();
    } catch (err) {
      console.error("Error submitting ad:", err);
      alert(err.message || err.error || "Failed to save advertisement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (adId) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) return;
    try {
      await deleteAdvertisement(adId);
      alert('Advertisement deleted successfully!');
      fetchAds();
    } catch (err) {
      console.error('Error deleting ad:', err);
      alert(err.message || err.error || 'Failed to delete advertisement.');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Ads & Banners</h1>
              <p className="text-sm text-muted-foreground">
                Manage your advertisements to promote your shop
              </p>
            </div>
            <button
              onClick={() => handleOpenModal("add")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10 px-4 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Ads Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground mt-2">Loading advertisements...</p>
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
              <div className="text-4xl mb-3">📢</div>
              <p className="text-muted-foreground">No advertisements found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create a new banner or ad to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => (
                <div key={ad._id || ad.id} className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden flex flex-col">
                  {/* Image */}
                  <div className="relative h-40 bg-muted flex items-center justify-center">
                    {ad.image ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://172.20.10.5:8000'}/uploads/${ad.image}`}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<span class="text-4xl">🖼️</span>';
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-muted-foreground" />
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => handleOpenModal("edit", ad)}
                        className="w-8 h-8 rounded-lg bg-background/80 hover:bg-background flex items-center justify-center text-foreground backdrop-blur shadow-sm"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ad._id || ad.id)}
                        className="w-8 h-8 rounded-lg bg-destructive/80 hover:bg-destructive flex items-center justify-center text-white backdrop-blur shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg ${ad.type === 'banner' ? 'bg-blue-500/90 text-white' : 'bg-purple-500/90 text-white'} backdrop-blur shadow-sm uppercase`}>
                        {ad.type}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-foreground truncate mr-2" title={ad.title}>{ad.title}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ad.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {ad.status}
                      </span>
                    </div>
                    
                    {ad.targetUrl && (
                      <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mb-2 block truncate">
                        {ad.targetUrl}
                      </a>
                    )}
                    
                    <div className="mt-auto pt-3 border-t border-border/50 text-xs text-muted-foreground grid grid-cols-2 gap-2">
                      <div>
                        <span className="block font-medium text-foreground">Valid From</span>
                        {ad.validFrom ? new Date(ad.validFrom).toLocaleDateString() : 'N/A'}
                      </div>
                      <div>
                        <span className="block font-medium text-foreground">Valid Until</span>
                        {ad.validUntil ? new Date(ad.validUntil).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Overlay */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col my-auto">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">
                  {modalMode === "add" ? "Create Advertisement" : "Edit Advertisement"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none"
                    placeholder="Enter title"
                  />
                </div>

                {/* Type & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none"
                    >
                      <option value="banner">Banner</option>
                      <option value="ad">Ad</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Target URL */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Target URL
                  </label>
                  <input
                    type="url"
                    name="targetUrl"
                    value={formData.targetUrl}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none"
                    placeholder="https://example.com"
                  />
                </div>

                {/* Validity Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Valid From
                    </label>
                    <input
                      type="date"
                      name="validFrom"
                      value={formData.validFrom}
                      onChange={handleInputChange}
                      className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Valid Until
                    </label>
                    <input
                      type="date"
                      name="validUntil"
                      value={formData.validUntil}
                      onChange={handleInputChange}
                      className="w-full h-10 px-3 rounded-xl bg-muted border-none text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Image {modalMode === "add" && "*"}
                  </label>
                  <div className="mt-1 flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center overflow-hidden border border-border">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                        required={modalMode === "add" && !currentAd?.image}
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-muted hover:bg-muted/80 text-sm font-medium cursor-pointer transition-colors"
                      >
                        Choose Image
                      </label>
                      <p className="text-xs text-muted-foreground mt-2">
                        Recommended: 1200x400 for Banners, 800x800 for Ads
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 mt-4 border-t border-border">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Saving..." : "Save Advertisement"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdsPage;
