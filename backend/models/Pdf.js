const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema({
  user_id: {type: mongoose.Schema.Types.ObjectId,ref: "Usermodel",required: true },
  title: {type: String,required: true },  // Forces a name to be provided on upload
  price: {type: Number,default: 0 }, // Defaults to free, but ready for your paid feature
  fileUrl: String,
  createdAt: {type: Date,default: Date.now},
  salesCount: {type: Number,default: 0 }
});

module.exports = mongoose.model("Pdf", pdfSchema);