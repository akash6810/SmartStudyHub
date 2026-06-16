import React, { useEffect, useState } from "react";
import API from "../api/axiosConfig";

import toast from "react-hot-toast";
import Navbar from "../Components/Navbar.jsx";
import "../Styles/Home.css"; 

const Home = () => {
  const [pdfs, setPdfs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  // ✨ NEW: State to hold an array of PDF IDs the user has purchased
  const [purchasedIds, setPurchasedIds] = useState([]);

  // Parse user info stored in localStorage during login
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data", error);
      }
    }
  }, []);

  const fetchPdfs = async () => {
    try {
      const res = await API.get("/api/pdf/all-pdfs");
      setPdfs(res.data.pdfs);
    } catch (error) {
      console.log(error);
    }
  };

  // ✨ NEW: Function to fetch what the user has already bought
  const fetchPurchasedIds = async () => {
    const token = localStorage.getItem("token");
    if (!token) return; // If not logged in, they haven't purchased anything
    
    try {
      const res = await API.get("/api/pdf/purchased", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Extract just the _id strings from the populated PDF objects
      const ids = res.data.purchasedPdfs.map(pdf => pdf._id);
      setPurchasedIds(ids);
    } catch (error) {
      console.log("Failed to fetch purchased IDs", error);
    }
  };

  useEffect(() => {
    fetchPdfs();
    fetchPurchasedIds(); // ✨ NEW: Call this when the component mounts
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async (pdf) => {
    const isScriptLoaded = await loadRazorpayScript();

    if (!isScriptLoaded) {
      toast.error("Razorpay SDK failed to load. Please check your internet connection.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const orderResponse = await API.post(
        "/api/payment/create-order",
        { pdfId: pdf._id },
        { headers }
      );

      const { order } = orderResponse.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: order.amount, 
        currency: "INR",
        name: "AiSmartStudyHub",
        description: `Purchase: ${pdf.title}`,
        order_id: order.id, 
        handler: async function (response) {
          try {
            const verifyResponse = await API.post(
              "/api/payment/verify-payment",
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                pdfId: pdf._id,
              },
              { headers }
            );

            if (verifyResponse.data.success) {
              toast.success("Payment verified successfully! Access granted.");
              
              window.open(pdf.fileUrl, "_blank", "noreferrer");
              
              // ✨ NEW: Refresh both lists so the button flips to "View PDF" immediately!
              fetchPdfs();
              fetchPurchasedIds(); 
            }
          } catch (error) {
            toast.error(error.response?.data?.message || "Payment verification check failed.");
          }
        },
        theme: {
          color: "#111827", 
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Unable to process transaction checkout initialization.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="home-container">
        <h1>All Uploaded Notes</h1>

        <div className="pdf-grid">
          {pdfs.map((pdf) => {
            // ✨ Fallback added for _id vs id just in case your backend uses _id!
            const isOwner = currentUser && (pdf.user_id === currentUser.id || pdf.user_id === currentUser._id);
            const isFree = pdf.price === 0;
            
            // ✨ NEW: Check if this specific PDF's ID is inside our purchasedIds array
            const isPurchased = purchasedIds.includes(pdf._id);

            return (
              <div key={pdf._id} className="pdf-card">
                <h3>{pdf.title}</h3> 
                <p>Uploaded: {new Date(pdf.createdAt).toLocaleDateString()}</p>
                <p>Price: {isFree ? "Free" : `₹${pdf.price}`}</p> 

                {/* ✨ NEW: isPurchased added to the conditional rendering */}
                {isOwner || isFree || isPurchased ? (
                  <a
                    href={pdf.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="pdf-link-btn"
                  >
                    View PDF
                  </a>
                ) : (
                  <button 
                    onClick={() => handlePurchase(pdf)} 
                    className="pdf-buy-btn"
                  >
                    Unlock PDF
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;