// server.js
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

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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

const users = new Map();

io.on("connection", (socket) => {
  console.log("🔗 Connected:", socket.id);

  socket.on("register", (email) => {
    users.set(email, socket.id);
  });

  socket.on("call", ({ to, offer, from }) => {
    const targetSocket = users.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit("incoming-call", { from, offer });
    }
  });

  socket.on("answer", ({ to, answer }) => {
    const targetSocket = users.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit("call-answered", { answer });
    }
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    const targetSocket = users.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit("ice-candidate", { candidate });
    }
  });

  socket.on("end-call", ({ to }) => {
    const targetSocket = users.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit("call-ended");
    }
  });
});

server.listen(process.env.PORT || 8000, () =>
  console.log(`🚀 Server running at http://localhost:${process.env.PORT || 8000}`)
);

