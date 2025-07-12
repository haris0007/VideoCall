const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const Otp = require("./models/Otp");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// OTP Routes
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.findOneAndUpdate({ email }, { otp, createdAt: new Date() }, { upsert: true });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP",
    text: `Your OTP is: ${otp}`
  });

  res.json({ success: true, message: "OTP sent" });
});

app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const record = await Otp.findOne({ email });

  if (record && record.otp === otp) {
    await Otp.deleteOne({ email });
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Invalid OTP" });
  }
});

// WebRTC Signaling via Socket.IO
const users = new Map();

io.on("connection", (socket) => {
  console.log("🔗 New user connected:", socket.id);

  socket.on("register", (email) => {
    users.set(email, socket.id);
    socket.email = email;
  });

  socket.on("call", ({ to, offer }) => {
    const targetId = users.get(to);
    if (targetId) {
      io.to(targetId).emit("incoming-call", { from: socket.id, offer });
    }
  });

  socket.on("reject-call", ({ to }) => {
  const targetId = users.get(to);
  if (targetId) {
    io.to(targetId).emit("call-rejected");
  }
});

socket.on("end-call", ({ to }) => {
  const targetId = users.get(to);
  if (targetId) {
    io.to(targetId).emit("call-ended");
  }
});


  socket.on("answer", ({ to, answer }) => {
    io.to(to).emit("call-answered", { from: socket.id, answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { from: socket.id, candidate });
  });

  socket.on("disconnect", () => {
    if (socket.email) users.delete(socket.email);
  });
});

server.listen(process.env.PORT || 8000, () =>
  console.log(`🚀 Server running at http://localhost:${process.env.PORT || 8000}`)
);

