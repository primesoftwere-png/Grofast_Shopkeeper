"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
} from "lucide-react";
import { register } from "@/services/authService";
import { getToken } from "@/lib/axios";

const steps = ["Basic Info", "Shop Details", "Location & Timing", "Review"];

const shopCategories = ["Grocery", "Vegetables", "Fruits", "Dairy", "Bakery", "Other"];

const Register = () => {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if already logged in
  useEffect(() => {
    const token = getToken();
    if (token) {
      // Already logged in, redirect to dashboard
      router.push("/");
    }
  }, [router]);

  const [form, setForm] = useState({
    // Basic Info (Step 0)
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    
    // Shop Details (Step 1)
    shopName: "",
    shopCategory: "Grocery",
    shopGST: "",
    shopLicenseNo: "",
    shopImage: "",
    
    // Location & Timing (Step 2)
    address: "",
    city: "",
    pincode: "",
    longitude: "",
    latitude: "",
    openingTime: "",
    closingTime: "",
  });

  const setField = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      // Prepare data according to API spec
      const registrationData = {
        // Mandatory fields
        shopName: form.shopName,
        ownerName: form.ownerName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        shopCategory: form.shopCategory,
        address: form.address,
        city: form.city,
        pincode: form.pincode,
        location: {
          coordinates: [
            parseFloat(form.longitude) || 0,
            parseFloat(form.latitude) || 0
          ]
        },
        openingTime: form.openingTime,
        closingTime: form.closingTime,
        
        // Optional fields
        ...(form.shopGST && { shopGST: form.shopGST }),
        ...(form.shopLicenseNo && { shopLicenseNo: form.shopLicenseNo }),
        ...(form.shopImage && { shopImage: form.shopImage }),
      };

      console.log('Sending registration data:', registrationData);
      const response = await register(registrationData);
      console.log('Registration Response:', response);
      
      // Check if registration was successful
      if (response && response.success) {
        alert(`✅ ${response.message || 'Registration successful! Awaiting admin approval.'}`);
        router.push("/login");
      } else {
        setError(response?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error('Registration Error:', err);
      
      // Handle validation errors
      if (err.errors && Array.isArray(err.errors)) {
        const errorMessages = err.errors.map(e => e.msg).join(', ');
        setError(errorMessages);
      } else {
        setError(err.message || "Registration failed. Please check your details and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setError("");
    
    // Validate Step 0: Basic Info
    if (step === 0) {
      if (!form.ownerName || !form.email || !form.phone || !form.password) {
        setError("Please fill in all required fields");
        return;
      }
      if (form.phone.length !== 10) {
        setError("Phone number must be 10 digits");
        return;
      }
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
    }
    
    // Validate Step 1: Shop Details
    if (step === 1) {
      if (!form.shopName || !form.shopCategory) {
        setError("Please fill in all required shop details");
        return;
      }
    }
    
    // Validate Step 2: Location & Timing
    if (step === 2) {
      if (!form.address || !form.city || !form.pincode || !form.openingTime || !form.closingTime) {
        setError("Please fill in all required location and timing details");
        return;
      }
      if (form.pincode.length !== 6) {
        setError("Pincode must be 6 digits");
        return;
      }
    }
    
    // Move to next step or submit
    if (step === 3) {
      handleSubmit();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-muted">
      <div className="w-full max-w-2xl bg-card rounded-3xl shadow-elevated p-6 sm:p-10">
        {/* Back */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">GroFast Shopkeeper Registration</span>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-1 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i <= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className="text-[10px] mt-1 text-muted-foreground hidden sm:block text-center">
                {s}
              </span>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Steps */}
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {/* Step 0 - Basic Info */}
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Basic Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Owner Name *</label>
                  <input
                    type="text"
                    placeholder="John Merchant"
                    value={form.ownerName}
                    onChange={(e) => setField("ownerName", e.target.value)}
                    required
                    className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email *</label>
                  <input
                    type="email"
                    placeholder="john@shop.com"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    required
                    className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone (10 digits) *</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    required
                    maxLength={10}
                    className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Password (min 6 characters) *</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    required
                    className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1 - Shop Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Shop Details</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Shop Name *</label>
                  <input
                    type="text"
                    placeholder="John's Grocery Store"
                    value={form.shopName}
                    onChange={(e) => setField("shopName", e.target.value)}
                    required
                    className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Shop Category *</label>
                  <select
                    value={form.shopCategory}
                    onChange={(e) => setField("shopCategory", e.target.value)}
                    required
                    className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none"
                  >
                    {shopCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Shop Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/shop.jpg"
                    value={form.shopImage}
                    onChange={(e) => setField("shopImage", e.target.value)}
                    className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">GST Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="27ABCDE1234F1Z5"
                    value={form.shopGST}
                    onChange={(e) => setField("shopGST", e.target.value)}
                    className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">License Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="LIC123456"
                    value={form.shopLicenseNo}
                    onChange={(e) => setField("shopLicenseNo", e.target.value)}
                    className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 - Location & Timing */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Location & Timing</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Shop Address *</label>
                  <textarea
                    placeholder="123 Main Street, Near City Mall, Andheri West"
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                    required
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl bg-muted border-none text-sm outline-none resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">City *</label>
                  <input
                    type="text"
                    placeholder="Mumbai"
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                    required
                    className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Pincode (6 digits) *</label>
                  <input
                    type="text"
                    placeholder="400058"
                    value={form.pincode}
                    onChange={(e) => setField("pincode", e.target.value)}
                    required
                    maxLength={6}
                    className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Longitude (Optional)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="72.8397"
                    value={form.longitude}
                    onChange={(e) => setField("longitude", e.target.value)}
                    className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Latitude (Optional)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="19.1334"
                    value={form.latitude}
                    onChange={(e) => setField("latitude", e.target.value)}
                    className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Opening Time *</label>
                  <input
                    type="time"
                    value={form.openingTime}
                    onChange={(e) => setField("openingTime", e.target.value)}
                    required
                    className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Closing Time *</label>
                  <input
                    type="time"
                    value={form.closingTime}
                    onChange={(e) => setField("closingTime", e.target.value)}
                    required
                    className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 - Review */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Review & Confirm</h3>

              <div className="bg-muted rounded-2xl p-4 space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Basic Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Owner:</span> <span className="font-medium">{form.ownerName}</span></p>
                    <p><span className="text-muted-foreground">Email:</span> <span className="font-medium">{form.email}</span></p>
                    <p><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{form.phone}</span></p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Shop Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Shop Name:</span> <span className="font-medium">{form.shopName}</span></p>
                    <p><span className="text-muted-foreground">Category:</span> <span className="font-medium">{form.shopCategory}</span></p>
                    {form.shopGST && <p><span className="text-muted-foreground">GST:</span> <span className="font-medium">{form.shopGST}</span></p>}
                    {form.shopLicenseNo && <p><span className="text-muted-foreground">License:</span> <span className="font-medium">{form.shopLicenseNo}</span></p>}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Location & Timing</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Address:</span> <span className="font-medium">{form.address}</span></p>
                    <p><span className="text-muted-foreground">City:</span> <span className="font-medium">{form.city}, {form.pincode}</span></p>
                    <p><span className="text-muted-foreground">Timing:</span> <span className="font-medium">{form.openingTime} - {form.closingTime}</span></p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-2xl p-4 text-sm text-secondary-foreground">
                <p className="font-medium mb-1">⚠️ Important</p>
                <p>Your registration will be reviewed by our admin team. You'll be able to login once your account is approved.</p>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              disabled={loading}
              className="flex-1 h-11 rounded-2xl border border-border text-sm hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 inline mr-1" /> Back
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={loading}
            className="flex-1 h-11 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></span>
                Submitting...
              </span>
            ) : step === 3 ? (
              <>
                <Check className="w-4 h-4 inline mr-1" /> Submit Registration
              </>
            ) : (
              <>
                Next <ArrowRight className="w-4 h-4 inline ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
