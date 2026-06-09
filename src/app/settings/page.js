"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  getAllSettings, 
  updateProfile, 
  updateLocation, 
  updateBusinessHours, 
  updateBankDetails, 
  changePassword 
} from "@/services/settingsService";
import dynamic from "next/dynamic";
import { User, MapPin, Clock, CreditCard, Lock, Save } from "lucide-react";

// Dynamically import the map so SSR doesn't crash on window object
const LocationMap = dynamic(() => import("@/components/LocationMap"), { ssr: false });

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // States for forms
  const [profileForm, setProfileForm] = useState({ fullname: "", phone: "", email: "" });
  const [locationForm, setLocationForm] = useState({ latitude: null, longitude: null });
  const [hoursForm, setHoursForm] = useState({ openingTime: "", closingTime: "" });
  const [bankForm, setBankForm] = useState({ accountHolderName: "", bankAccountNumber: "", ifscCode: "", bankName: "", branchName: "", upiId: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getAllSettings();
      const payload = res?.data?.data || res?.data || res;
      if (payload) {
        if (payload.user) {
          setProfileForm({
            fullname: payload.user.fullname || "",
            phone: payload.user.phone || "",
            email: payload.user.email || ""
          });
        }
        if (payload.shop) {
          setLocationForm({
            latitude: payload.shop.latitude || 20.5937,
            longitude: payload.shop.longitude || 78.9629
          });
          setHoursForm({
            openingTime: payload.shop.openingTime || "",
            closingTime: payload.shop.closingTime || ""
          });
        }
        if (payload.bankDetails) {
          setBankForm({
            accountHolderName: payload.bankDetails.accountHolderName || "",
            bankAccountNumber: payload.bankDetails.bankAccountNumber || "",
            ifscCode: payload.bankDetails.ifscCode || "",
            bankName: payload.bankDetails.bankName || "",
            branchName: payload.bankDetails.branchName || "",
            upiId: payload.bankDetails.upiId || ""
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  // Handlers
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(profileForm);
      showMessage("Profile updated successfully!");
    } catch (err) {
      showMessage("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLocation = async () => {
    if (!locationForm.latitude || !locationForm.longitude) {
      showMessage("Please set a location on the map", "error");
      return;
    }
    setSaving(true);
    try {
      await updateLocation(locationForm);
      showMessage("Shop location updated successfully!");
    } catch (err) {
      showMessage("Failed to update location", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateHours = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateBusinessHours(hoursForm);
      showMessage("Business hours updated successfully!");
    } catch (err) {
      showMessage("Failed to update hours", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBankDetails = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateBankDetails(bankForm);
      showMessage("Bank details updated successfully!");
    } catch (err) {
      showMessage("Failed to update bank details", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await changePassword(passwordForm);
      showMessage("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      showMessage("Failed to change password", "error");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Personal Info", icon: User },
    { id: "location", label: "Shop Location", icon: MapPin },
    { id: "hours", label: "Business Hours", icon: Clock },
    { id: "bank", label: "Bank Details", icon: CreditCard },
    { id: "security", label: "Security", icon: Lock },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings & Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your account preferences, business hours, and shop details.</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-600' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 flex-shrink-0 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 bg-card rounded-3xl shadow-elevated p-6 sm:p-8">
            
            {/* Personal Profile */}
            {activeTab === "profile" && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-6">Personal Information</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.fullname}
                      onChange={(e) => setProfileForm({ ...profileForm, fullname: e.target.value })}
                      className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Phone</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="pt-4">
                    <button type="submit" disabled={saving} className="h-11 px-6 rounded-2xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                      {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Shop Location */}
            {activeTab === "location" && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Shop Location</h2>
                <p className="text-sm text-muted-foreground mb-6">Drag the map or click to update your shop's exact location.</p>
                <div className="mb-6 border border-border rounded-2xl overflow-hidden shadow-sm">
                  {locationForm.latitude !== null && (
                    <LocationMap 
                      defaultLat={locationForm.latitude} 
                      defaultLng={locationForm.longitude} 
                      onPositionChange={(lat, lng) => {
                        setLocationForm({ latitude: lat, longitude: lng });
                      }}
                    />
                  )}
                </div>
                <div>
                  <button onClick={handleUpdateLocation} disabled={saving} className="h-11 px-6 rounded-2xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                    {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Location</>}
                  </button>
                </div>
              </div>
            )}

            {/* Business Hours */}
            {activeTab === "hours" && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-6">Business Hours</h2>
                <form onSubmit={handleUpdateHours} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Opening Time</label>
                    <input
                      type="time"
                      value={hoursForm.openingTime}
                      onChange={(e) => setHoursForm({ ...hoursForm, openingTime: e.target.value })}
                      className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Closing Time</label>
                    <input
                      type="time"
                      value={hoursForm.closingTime}
                      onChange={(e) => setHoursForm({ ...hoursForm, closingTime: e.target.value })}
                      className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2 pt-2">
                    <button type="submit" disabled={saving} className="h-11 px-6 rounded-2xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                      {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Hours</>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Bank Details */}
            {activeTab === "bank" && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-6">Bank Details</h2>
                <form onSubmit={handleUpdateBankDetails} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-foreground">Account Holder Name</label>
                    <input
                      type="text"
                      value={bankForm.accountHolderName}
                      onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                      className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Bank Account Number</label>
                    <input
                      type="text"
                      value={bankForm.bankAccountNumber}
                      onChange={(e) => setBankForm({ ...bankForm, bankAccountNumber: e.target.value })}
                      className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">IFSC Code</label>
                    <input
                      type="text"
                      value={bankForm.ifscCode}
                      onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                      className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Bank Name</label>
                    <input
                      type="text"
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                      className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">UPI ID (Optional)</label>
                    <input
                      type="text"
                      value={bankForm.upiId}
                      onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                      className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="sm:col-span-2 pt-4">
                    <button type="submit" disabled={saving} className="h-11 px-6 rounded-2xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                      {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Bank Details</>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-6">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>
                  <div className="pt-4">
                    <button type="submit" disabled={saving} className="h-11 px-6 rounded-2xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                      {saving ? "Saving..." : <><Save className="w-4 h-4" /> Update Password</>}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
