import React, { useEffect, useState } from "react";
import API from "../api/axiosConfig";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import "../Styles/Sell.css";

const Sell = () => {
  const [stats, setStats] = useState({ walletBalance: 0, totalSales: 0, myPdfs: [] });
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/api/pdf/seller-stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (error) {
      toast.error("Failed to load dashboard statistics.");
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        "/api/withdraw/request",
        { amount: Number(amount), paymentMethod, upiId, accountNumber, ifscCode, accountHolderName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setStats((prev) => ({ ...prev, walletBalance: res.data.walletBalance }));
        setShowForm(false);
        setAmount("");
        setUpiId("");
        setAccountNumber("");
        setIfscCode("");
        setAccountHolderName("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Withdrawal request failed.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <h1>Seller Dashboard</h1>

        <div className="stats-header">
          <div className="stat-box">
            <h3>Total Earnings (80% Split)</h3>
            <h1>₹{stats.walletBalance.toFixed(2)}</h1>
            {stats.walletBalance > 0 && (
              <button className="withdraw-btn" onClick={() => setShowForm(!showForm)}>
                {showForm ? "Cancel" : "Withdraw Funds"}
              </button>
            )}
          </div>
          <div className="stat-box">
            <h3>Total Files Sold</h3>
            <h1 style={{ color: "#60a5fa" }}>{stats.totalSales}</h1>
          </div>
        </div>

        {/* Dynamic Request Form */}
        {showForm && (
          <form className="withdraw-form" onSubmit={handleWithdrawSubmit}>
            <h3>Request Cash Out</h3>
            <div className="form-group">
              <label>Amount to Withdraw (₹)</label>
              <input 
                type="number" 
                max={stats.walletBalance} 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Payout Option</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="UPI">UPI ID</option>
                <option value="Bank Transfer">Bank Account Transfer</option>
              </select>
            </div>

            <div className="form-group">
              <label>Account Holder Name</label>
              <input type="text" value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} required />
            </div>

            {paymentMethod === "UPI" ? (
              <div className="form-group">
                <label>UPI ID (e.g., name@okaxis)</label>
                <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} required />
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label>Account Number</label>
                  <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>IFSC Code</label>
                  <input type="text" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} required />
                </div>
              </>
            )}
            <button type="submit" className="submit-withdraw-btn">Submit Request</button>
          </form>
        )}

        <h2>Performance by File</h2>
        {stats.myPdfs.length === 0 ? (
          <p>You haven't uploaded any notes to sell yet.</p>
        ) : (
          <div className="dashboard-grid">
            {stats.myPdfs.map((pdf) => {
              const earnedFromThisFile = (pdf.price * 0.80) * (pdf.salesCount || 0);
              return (
                <div key={pdf._id} className="dashboard-card">
                  <h3>{pdf.title}</h3>
                  <div className="metric"><span>Listing Price:</span><span>₹{pdf.price}</span></div>
                  <div className="metric"><span>Times Bought:</span><span>{pdf.salesCount || 0}</span></div>
                  <div className="metric" style={{ borderBottom: "none", color: "#28a745" }}>
                    <span>Earned from File:</span><span>₹earnedFromThisFile.toFixed(2)</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sell;