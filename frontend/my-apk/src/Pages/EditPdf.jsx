import React, { useEffect, useState } from "react";
import API from "../api/axiosConfig";

import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import "../Styles/EditPdf.css";

const EditPdf = () => {
  const [myPdfs, setMyPdfs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  
  // State for the form inputs
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const fetchMyPdfs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/api/pdf/my-pdfs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyPdfs(res.data.pdfs);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch your PDFs");
    }
  };

  useEffect(() => {
    fetchMyPdfs();
  }, []);

  const handleEditClick = (pdf) => {
    setEditingId(pdf._id);
    setEditTitle(pdf.title);
    setEditPrice(pdf.price);
  };

  const handleSave = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.put(
        `/api/pdf/update/${id}`,
        { title: editTitle, price: editPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message);
      setEditingId(null); 
      fetchMyPdfs(); // Refresh the list to show updated data
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="edit-container">
        <h1>Edit My Uploaded Notes</h1>
        
        {myPdfs.length === 0 ? (
          <p>You haven't uploaded any PDFs yet.</p>
        ) : (
          <div className="edit-grid">
            {myPdfs.map((pdf) => (
              <div key={pdf._id} className="edit-card">
                
                {/* EDIT MODE */}
                {editingId === pdf._id ? (
                  <div>
                    <input
                      type="text"
                      className="edit-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <input
                      type="number"
                      className="edit-input"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                    />
                    
                    <button className="action-btn save-btn" onClick={() => handleSave(pdf._id)}>Save</button>
                    <button className="action-btn cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                ) : (
                  /* VIEW MODE */
                  <div>
                    <h3>{pdf.title}</h3>
                    <p>Price: ₹{pdf.price}</p>
                    <p>Uploaded: {new Date(pdf.createdAt).toLocaleDateString()}</p>
                    
                    <button className="action-btn edit-btn" onClick={() => handleEditClick(pdf)}>Edit Details</button>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditPdf;