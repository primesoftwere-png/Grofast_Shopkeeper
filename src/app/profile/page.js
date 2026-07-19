"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getProfile, updateShop } from "@/services/authService";
import { updateProfile, updateBankDetails } from "@/services/settingsService";
import { toast } from "react-hot-toast";
import { 
  User, Store, CreditCard, Wallet, FileText, 
  Edit2, Save, X, MapPin, Phone, Mail, 
  Clock, CheckCircle, AlertCircle, Camera, Banknote, ShieldAlert, BadgeCheck
} from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Track edit modes for different sections
  const [editModes, setEditModes] = useState({
    shopkeeper: false,
    shop: false,
    bankDetails: false,
    kyc: false
  });

  // Track form data for edits
  const [formData, setFormData] = useState({
    shopkeeper: {},
    shop: {},
    bankDetails: {},
    kyc: {}
  });

  // Saving state
  const [saving, setSaving] = useState({
    shopkeeper: false,
    shop: false,
    bankDetails: false,
    kyc: false
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      if (response?.data?.success || response?.data) {
        const data = response.data.data || response.data;
        setProfileData(data);
        
        // Initialize form data with current values or empty objects if null
        setFormData({
          shopkeeper: {
            fullname: data.shopkeeper?.userId?.fullname || "",
            email: data.shopkeeper?.userId?.email || "",
            phone: data.shopkeeper?.userId?.phone || "",
            licenseNumber: data.shopkeeper?.licenseNumber || "",
            gstNumber: data.shopkeeper?.gstNumber || "",
          },
          shop: data.shop || {},
          bankDetails: data.bankDetails || {},
          kyc: data.kyc || {}
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEdit = (section) => {
    setEditModes((prev) => ({ ...prev, [section]: true }));
    
    // Reset form data to current profile data when entering edit mode
    if (section === 'shopkeeper') {
      setFormData((prev) => ({
        ...prev,
        shopkeeper: {
          fullname: profileData.shopkeeper?.userId?.fullname || "",
          email: profileData.shopkeeper?.userId?.email || "",
          phone: profileData.shopkeeper?.userId?.phone || "",
          licenseNumber: profileData.shopkeeper?.licenseNumber || "",
          gstNumber: profileData.shopkeeper?.gstNumber || "",
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [section]: profileData[section] || {},
      }));
    }
  };

  const handleCancel = (section) => {
    setEditModes((prev) => ({ ...prev, [section]: false }));
  };

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async (section) => {
    setSaving((prev) => ({ ...prev, [section]: true }));
    try {
      let response;
      if (section === 'shopkeeper') {
        response = await updateProfile(formData.shopkeeper);
      } else if (section === 'shop') {
        response = await updateShop(formData.shop);
      } else if (section === 'bankDetails') {
        response = await updateBankDetails(formData.bankDetails);
      }

      // We assume a 200 OK or success true is good
      if (response?.success || response?.data?.success || response?.status === 200 || response?.status === 201) {
        toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully!`);
        setEditModes((prev) => ({ ...prev, [section]: false }));
        fetchProfile(); // Refresh data to get latest updates
      } else {
        throw new Error(response?.message || response?.data?.message || "Failed to update");
      }
    } catch (error) {
      console.error(`Error updating ${section}:`, error);
      toast.error(error?.response?.data?.message || error.message || `Failed to update ${section}`);
    } finally {
      setSaving((prev) => ({ ...prev, [section]: false }));
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profileData) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold text-foreground">Profile Not Found</h2>
          <p className="text-muted-foreground mt-2">Could not retrieve profile information. Please try again.</p>
          <button onClick={fetchProfile} className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const { shopkeeper, shop, kyc, bankDetails, wallet } = profileData;
  const user = shopkeeper?.userId || {};

  const renderSectionHeader = (title, icon, sectionKey) => {
    const isEditing = editModes[sectionKey];
    const isSaving = saving[sectionKey];

    return (
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/15 text-primary-dark rounded-xl">
            {icon}
          </div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
        </div>
        {sectionKey && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => handleCancel(sectionKey)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                  disabled={isSaving}
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={() => handleSave(sectionKey)}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button
                onClick={() => handleEdit(sectionKey)}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderInput = (section, field, label, type = "text", placeholder = "", displayValue = null) => {
    const isEditing = editModes[section];
    
    // Determine the current value
    let value = isEditing ? formData[section]?.[field] : (displayValue !== null ? displayValue : profileData[section]?.[field]);
    if (section === 'shopkeeper' && displayValue === null && !isEditing) {
      if (['fullname', 'email', 'phone'].includes(field)) {
        value = profileData.shopkeeper?.userId?.[field];
      } else {
        value = profileData.shopkeeper?.[field];
      }
    }

    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        {isEditing ? (
          <input
            type={type}
            value={value || ""}
            onChange={(e) => handleChange(section, field, e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
          />
        ) : (
          <p className="text-base font-medium text-foreground py-2">{value || <span className="text-muted-foreground italic">Not provided</span>}</p>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile Overview</h1>
            <p className="text-muted-foreground mt-1">Manage your personal, business, and financial information.</p>
          </div>
          
          {/* Quick Wallet Stats */}
          {wallet && (
            <div className="bg-gradient-to-r from-primary to-primary-dark p-0.5 rounded-2xl shadow-elevated">
              <div className="bg-card rounded-2xl px-6 py-4 flex items-center gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Wallet Balance</p>
                  <p className="text-2xl font-bold text-foreground">₹{wallet?.balance?.toLocaleString() || 0}</p>
                </div>
                <div className="w-12 h-12 bg-primary/15 text-primary-dark rounded-full flex items-center justify-center">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Shopkeeper Details */}
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
              {renderSectionHeader("Personal Details", <User className="w-6 h-6" />, "shopkeeper")}
              
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center overflow-hidden border-4 border-background shadow-md">
                    {user?.profileImage ? (
                      <Image 
                        src={user.profileImage} 
                        alt="Profile" 
                        fill 
                        className="object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-muted-foreground" />
                    )}
                  </div>
                  {editModes.shopkeeper && (
                    <button className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full shadow-md hover:bg-primary-dark transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <h3 className="text-xl font-bold mt-4 text-foreground text-center capitalize">
                  {user?.fullname || "Unknown User"}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full capitalize">
                    {user?.role || "Shop Owner"}
                  </span>
                  {user?.accountStatus === 'active' && (
                    <span className="px-2 py-1 bg-success/10 text-success text-xs font-semibold rounded-full flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {renderInput("shopkeeper", "fullname", "Full Name")}
                
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground mt-6 shrink-0" />
                  <div className="flex-1">{renderInput("shopkeeper", "email", "Email Address", "email")}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground mt-6 shrink-0" />
                  <div className="flex-1">{renderInput("shopkeeper", "phone", "Phone Number", "tel")}</div>
                </div>

                <div className="pt-4 mt-4 border-t border-border space-y-4">
                  {renderInput("shopkeeper", "licenseNumber", "License Number")}
                  {renderInput("shopkeeper", "gstNumber", "GST Number")}
                </div>
              </div>
            </div>

            {/* KYC Status */}
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-info/15 text-info rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">KYC Documents</h2>
                </div>
                {kyc?.status === "VERIFIED" || kyc?.isVerified ? (
                  <span className="flex items-center gap-1.5 text-success font-medium text-sm bg-success/10 px-3 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4" /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-warning font-medium text-sm bg-warning/10 px-3 py-1 rounded-full">
                    <AlertCircle className="w-4 h-4" /> Pending
                  </span>
                )}
              </div>
              
              {kyc ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Document Type</label>
                    <p className="font-medium text-foreground py-1">{kyc.documentType || "Not Specified"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Document Number</label>
                    <p className="font-medium text-foreground py-1 font-mono">{kyc.documentNumber || "XXXX-XXXX-XXXX"}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No KYC documents added yet.</p>
                  <button className="mt-4 px-4 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-lg hover:opacity-90">
                    Upload Documents
                  </button>
                </div>
              )}
            </div>
            
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Shop Details */}
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
              {renderSectionHeader("Business Profile", <Store className="w-6 h-6" />, "shop")}
              
              {/* Verification & Status Banner */}
              <div className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Shop Verification Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {shop?.isVerified ? (
                      <span className="flex items-center gap-1 text-success font-semibold text-sm">
                        <CheckCircle className="w-4 h-4" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-warning font-semibold text-sm">
                        <AlertCircle className="w-4 h-4" /> Unverified
                      </span>
                    )}
                    <span className="text-muted-foreground text-sm px-2">|</span>
                    <span className={`text-sm font-semibold capitalize ${shop?.status === 'active' || shop?.status === 'ACTIVE' ? 'text-success' : 'text-destructive'}`}>
                      System Status: {shop?.status || "INACTIVE"}
                    </span>
                  </div>
                </div>
                
                <div className="h-10 w-px bg-border hidden sm:block"></div>
                
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1.5 block">Store Operating Status</p>
                  {editModes.shop ? (
                    <select
                      value={formData.shop?.isOpen ? "true" : "false"}
                      onChange={(e) => handleChange("shop", "isOpen", e.target.value === "true")}
                      className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                    >
                      <option value="true">Open</option>
                      <option value="false">Closed</option>
                    </select>
                  ) : (
                    <div>
                      {shop?.isOpen ? (
                        <span className="inline-flex items-center gap-1.5 bg-success/15 text-success px-3 py-1 rounded-full text-sm font-semibold">
                          <span className="w-2 h-2 rounded-full bg-success"></span> Open Now
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-destructive/15 text-destructive px-3 py-1 rounded-full text-sm font-semibold">
                          <span className="w-2 h-2 rounded-full bg-destructive"></span> Closed
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  {renderInput("shop", "shopName", "Shop Name")}
                </div>
                <div>
                  {renderInput("shop", "businessType", "Business Type")}
                </div>

                <div className="md:col-span-2 space-y-4">
                  <h4 className="font-semibold text-foreground border-b border-border pb-2 mt-2">Location Details</h4>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-7 shrink-0" />
                    <div className="flex-1">{renderInput("shop", "shopAddress", "Full Address")}</div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-8">
                    {renderInput("shop", "city", "City")}
                    {renderInput("shop", "state", "State")}
                    {renderInput("shop", "pincode", "Pincode")}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <h4 className="font-semibold text-foreground border-b border-border pb-2 mt-2">Operational Hours</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground mt-6 shrink-0" />
                      <div className="flex-1">{renderInput("shop", "openingTime", "Opening Time", "time")}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground mt-6 shrink-0" />
                      <div className="flex-1">{renderInput("shop", "closingTime", "Closing Time", "time")}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Detailed Summary */}
            {wallet && (
              <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/15 text-primary-dark rounded-xl">
                      <Banknote className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Earnings & Wallet</h2>
                  </div>
                  <span className="text-sm font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                    {wallet.currency || "INR"}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border flex flex-col justify-center">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Total Earnings</p>
                    <p className="text-xl font-bold text-foreground">₹{wallet.totalEarnings?.toLocaleString() || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 border border-border flex flex-col justify-center">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Cash Balance</p>
                    <p className="text-xl font-bold text-foreground">₹{wallet.cashBalance?.toLocaleString() || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 border border-border flex flex-col justify-center">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Total Withdrawn</p>
                    <p className="text-xl font-bold text-foreground">₹{wallet.totalWithdrawn?.toLocaleString() || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 flex flex-col justify-center">
                    <p className="text-xs font-medium text-destructive/80 mb-1">Platform Commission</p>
                    <p className="text-xl font-bold text-destructive">₹{wallet.totalPlatformCommission?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Details */}
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
              {renderSectionHeader("Bank Details", <CreditCard className="w-6 h-6" />, "bankDetails")}
              
              {bankDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    {renderInput("bankDetails", "bankName", "Bank Name")}
                  </div>
                  <div>
                    {renderInput("bankDetails", "accountName", "Account Holder Name")}
                  </div>
                  <div>
                    {renderInput("bankDetails", "accountNumber", "Account Number", "text")}
                  </div>
                  <div>
                    {renderInput("bankDetails", "ifscCode", "IFSC Code")}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No bank details added yet.</p>
                  {editModes.bankDetails ? (
                     <div className="text-left mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                       {renderInput("bankDetails", "bankName", "Bank Name")}
                       {renderInput("bankDetails", "accountName", "Account Holder Name")}
                       {renderInput("bankDetails", "accountNumber", "Account Number")}
                       {renderInput("bankDetails", "ifscCode", "IFSC Code")}
                     </div>
                  ) : (
                    <button 
                      onClick={() => handleEdit('bankDetails')}
                      className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90"
                    >
                      Add Bank Details
                    </button>
                  )}
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
