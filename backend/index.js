const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

// ✨ NEW: Required imports for Socket.io
const http = require("http");
const { Server } = require("socket.io");

// import AuthRoutes from './routes/Auth.routes.js'
const DbCon = require("./libs/db");
const AuthRoutes = require("./routes/Auth.routes");
const PdfRoutes = require("./routes/pdf.routes");
const withdrawalRoutes = require("./routes/withdrawal.routes")

const paymentRoutes = require("./routes/payment.routes");
const cors = require("cors"); 
DbCon();
const PORT=process.env.PORT || 5000;
const app=express();

// ✨ NEW: Create the HTTP Server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // Update this if your React app runs on a different port (like 3000)
    methods: ["GET", "POST"],
  },
});

// ✨ NEW: Live Chat Room Logic (15-message limit)
let chatMessages = [];

io.on("connection", (socket) => {
  console.log(`User Connected for Chat: ${socket.id}`);

  // Send history immediately when someone joins
  socket.emit("chatHistory", chatMessages);

  // Listen for incoming messages
  socket.on("sendMessage", (messageData) => {
    chatMessages.push(messageData);

    if (chatMessages.length > 15) {
      chatMessages = [messageData]; // Reset array keeping only the newest message
      io.emit("chatHistory", chatMessages); 
      io.emit("systemMessage", "Chat room refreshed after 15 messages!"); 
    } else {
      io.emit("receiveMessage", messageData);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

// --- YOUR EXISTING CODE BELOW THIS LINE ---

app.use(cors());
app.use(express.json());
app.use('/auth',AuthRoutes);
app.use("/api/pdf", PdfRoutes); 
app.use("/api/payment", paymentRoutes);
app.use("/api/withdraw", withdrawalRoutes);

// ⚠️ ONLY EXISTING LINE MODIFIED: app.listen is now server.listen
server.listen(PORT,()=>{
    console.log(`App is running on Port ${PORT}`)
})