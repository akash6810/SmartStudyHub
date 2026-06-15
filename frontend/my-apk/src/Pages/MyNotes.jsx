import React, { useEffect, useState } from "react";
import API from "../api/axiosConfig";

import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import "../Styles/MyNotes.css"; 

const MyNotes = () => {
  const [purchasedNotes, setPurchasedNotes] = useState([]);

  const fetchPurchasedNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/api/pdf/purchased", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPurchasedNotes(res.data.purchasedPdfs);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load your purchased notes.");
    }
  };

  useEffect(() => {
    fetchPurchasedNotes();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="mynotes-container">
        <h1>My Purchased Notes</h1>

        {purchasedNotes.length === 0 ? (
          <p>You haven't purchased any notes yet.</p>
        ) : (
          <div className="mynotes-grid">
            {purchasedNotes.map((pdf) => (
              <div key={pdf._id} className="mynotes-card">
                <div>
                  <h3>{pdf.title}</h3>
                  <p>Purchased on: {new Date(pdf.createdAt).toLocaleDateString()}</p>
                </div>

                <a
                  href={pdf.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="view-pdf-btn"
                >
                  View PDF
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyNotes;