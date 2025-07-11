const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String },              // optional for DM
  room: { type: String },            // optional for room messages
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", messageSchema);
