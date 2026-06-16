import React, { useState } from "react";
import API from "../api/axiosConfig";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import "../Styles/Uploadnotes.css"; 

const UploadNotes = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!title) {
      return toast.error("Please provide a title for the PDF");
    }
    if (!file) {
      return toast.error("Please select a PDF file");
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", price || 0); // Default to 0 if left blank
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");

      const res = await API.post(
        "/api/pdf/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Axios automatically sets the correct Content-Type for FormData
          },
        }
      );

      toast.success(res.data.message);
      
      // Clear the form after a successful upload
      setTitle("");
      setPrice("");
      setFile(null);
      e.target.reset(); 

    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div>
      <Navbar />
      
      <div className="upload-container">
        <form onSubmit={handleUpload} className="upload-form">
          <h2>Upload PDF Notes</h2>

          <input
            type="text"
            placeholder="PDF Title (e.g., React Basics)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="upload-input"
            required
          />

          <input
            type="number"
            placeholder="Price in ₹ (Leave blank for free)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="upload-input"
            min="0"
          />

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="upload-input"
            required
          />

          <button type="submit" className="upload-button">
            Upload
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadNotes;