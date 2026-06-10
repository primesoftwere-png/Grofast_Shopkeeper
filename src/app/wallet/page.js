"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Wallet, ArrowUpRight, History, CreditCard, Banknote, RefreshCcw } from "lucide-react";
import { getWalletDetails } from "@/services/walletService";
import { getSettlementSummary, getSettlements, requestSettlement } from "@/services/settlementService";

const WalletPage = () => {
  const [wallet, setWallet] = useState(null);
  const [settlementSummary, setSettlementSummary] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("BANK_TRANSFER");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [walletRes, summaryRes, listRes] = await Promise.all([
        getWalletDetails(),
        getSettlementSummary(),
        getSettlements(1, 10)
      ]);

      if (walletRes?.data) setWallet(walletRes.data);
      if (summaryRes?.data) setSettlementSummary(summaryRes.data);
      if (listRes?.data?.data) setSettlements(listRes.data.data);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    if (!payoutAmount || Number(payoutAmount) < 1100) {
      alert("Minimum payout amount is ₹1,100");
      return;
    }

    setRequesting(true);
    try {
      await requestSettlement({
        amount: Number(payoutAmount),
        paymentMode: payoutMethod
      });
      alert("Payout requested successfully!");
      setPayoutAmount("");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Payout request failed:", error);
      alert(error?.response?.data?.message || "Failed to request payout. Ensure your bank details are verified.");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Wallet & Payouts</h1>
          <p className="text-sm text-muted-foreground">Manage your earnings, balances, and settlements</p>
        </div>

        {loading ? (
          <div className="flex justify-center p-10"><RefreshCcw className="animate-spin text-primary w-8 h-8" /></div>
        ) : (
          <>
            {/* Top Cards: Wallet Balances */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm font-medium text-primary-dark">Available Balance</p>
                    <Wallet className="w-5 h-5 text-primary-dark" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">₹{wallet?.walletBalance?.toLocaleString() || 0}</h3>
                  <p className="text-xs text-muted-foreground mt-2">Ready for withdrawal</p>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm font-medium text-muted-foreground">Online Earnings</p>
                  <CreditCard className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">₹{wallet?.totalOnlineIncome?.toLocaleString() || 0}</h3>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm font-medium text-muted-foreground">Cash in Hand (COD)</p>
                  <Banknote className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">₹{wallet?.totalCashIncome?.toLocaleString() || 0}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Left Column: Settlement Request */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-primary" />
                    Request Payout
                  </h3>
                  <form onSubmit={handleRequestPayout} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Amount (₹)</label>
                      <input 
                        type="number" 
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        placeholder="Min ₹1,100"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                        required
                        min="1100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Payout Method</label>
                      <select 
                        value={payoutMethod}
                        onChange={(e) => setPayoutMethod(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                      >
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="UPI">UPI</option>
                      </select>
                    </div>
                    <button 
                      type="submit" 
                      disabled={requesting || wallet?.walletBalance < 1100}
                      className="w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {requesting ? "Requesting..." : "Withdraw Funds"}
                    </button>
                    {wallet?.walletBalance < 1100 && (
                      <p className="text-xs text-warning text-center mt-2">Insufficient balance for minimum payout.</p>
                    )}
                  </form>
                </div>

                <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    Settlement Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Pending</span>
                      <span className="font-medium">₹{settlementSummary?.pendingAmount?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Completed</span>
                      <span className="font-medium text-green-600">₹{settlementSummary?.completedAmount?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">Total Payouts</span>
                      <span className="font-medium">{settlementSummary?.totalSettlements || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Settlement History */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 h-full">
                  <h3 className="font-semibold text-foreground mb-4">Recent Settlements</h3>
                  
                  {settlements.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-sm">
                      No settlement requests found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground bg-muted/50 rounded-lg">
                          <tr>
                            <th className="px-4 py-3 rounded-l-lg font-medium">Date</th>
                            <th className="px-4 py-3 font-medium">ID</th>
                            <th className="px-4 py-3 font-medium">Method</th>
                            <th className="px-4 py-3 font-medium">Amount</th>
                            <th className="px-4 py-3 rounded-r-lg font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {settlements.map((settlement) => (
                            <tr key={settlement._id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                              <td className="px-4 py-3 text-foreground whitespace-nowrap">
                                {new Date(settlement.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {settlement.settlementNumber || settlement._id.slice(-6).toUpperCase()}
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 bg-muted rounded-md text-xs font-medium">
                                  {settlement.paymentMode}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-medium">
                                ₹{settlement.amount.toLocaleString()}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  settlement.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                  settlement.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                  settlement.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {settlement.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WalletPage;
