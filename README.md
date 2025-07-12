# 📹 WebRTC Video Calling App

A simple peer-to-peer video calling app built with **Express**, **Socket.IO**, **WebRTC**, and **MongoDB**. It features:

- ✅ OTP-based login (via email)
- ✅ One-to-one video calling
- ✅ Accept / Reject incoming calls
- ✅ ICE candidate handling
- ✅ Fullscreen remote video with self-preview in corner
- ✅ Proper call teardown and reconnection handling

---

## 📁 Folder Structure

```
├── models
│   └── Otp.js
├── public
│   ├── index.html      # Login (OTP)
│   └── video.html      # Video call UI
├── .env
├── server.js
├── package.json
```

---

## ⚙️ Installation

1. **Clone the repo**:
```bash
git clone https://github.com/yourname/video-call-app.git
cd video-call-app
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create a `.env` file**:
```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password_or_app_password
```

4. **Run the server**:
```bash
node server.js
```

---

## 🌐 Usage

1. Open `http://localhost:8000` in two different browser windows or devices.
2. Enter your email → receive OTP → login.
3. Once both users are logged in, enter the other user's email to initiate a call.
4. The receiver gets a popup to accept or reject the call.

---

## 📦 Dependencies

- express
- socket.io
- mongoose
- nodemailer
- dotenv
- body-parser

---

## 📞 How it works

- Users log in using OTP verification.
- When a user initiates a call, a WebRTC offer is created and sent via Socket.IO.
- The receiver gets a popup with options to accept/reject.
- If accepted, the receiver responds with an answer, and ICE candidates are exchanged.
- Video streams are connected peer-to-peer using WebRTC.

---

## 🔐 Notes

- Make sure your Gmail allows sending via less secure apps or use an App Password.
- STUN server used: `stun:stun.l.google.com:19302`

---

## 🛠️ Future Improvements

- Add audio/video toggle buttons
- Add online user list
- Show call duration
- Group calling support

---

## 📃 License

MIT License  
Copyright (c) 2025 **Hariskumar S**

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction...

(Full MIT license text continues here if needed)
s