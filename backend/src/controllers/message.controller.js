import Message from "../models/message.model.js";
import nodemailer from "nodemailer";

/* =======================================================
   EMAIL TRANSPORTER (BREVO SMTP)
======================================================= */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,         // smtp-relay.brevo.com
  port: process.env.SMTP_PORT,         // 587
  secure: false,                       // TLS, not SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/* =======================================================
   1️⃣ USER SENDS MESSAGE
======================================================= */
export const sendMessage = async (req, res) => {
  try {
    const { name, email, category, message } = req.body;

    // VALIDATION
    if (!name || !email || !category || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Save message in database
    const msg = await Message.create({
      name,
      email,
      category,
      message,
      status: "unread",
    });

    res.status(201).json({
      message: "Message received successfully",
      data: msg,
    });
  } catch (err) {
    console.log("Send Message Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =======================================================
   2️⃣ ADMIN — GET ALL MESSAGES
======================================================= */
export const getMessages = async (req, res) => {
  try {
    const msgs = await Message.find().sort({ createdAt: -1 });
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =======================================================
   3️⃣ ADMIN — MARK AS READ
======================================================= */
export const markAsRead = async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { status: "read" },
      { new: true }
    );

    if (!msg) return res.status(404).json({ message: "Message not found" });

    res.json({ message: "Marked as read", data: msg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =======================================================
   4️⃣ ADMIN — SEND REPLY (Email + Save in DB)
======================================================= */
export const replyToMessage = async (req, res) => {
  try {
    const { replyText } = req.body;

    if (!replyText || replyText.trim() === "") {
      return res.status(400).json({ message: "Reply cannot be empty" });
    }

    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    /* -------------------------------
       SEND EMAIL TO USER
    -------------------------------- */
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,      // Must be verified in Brevo!
        to: msg.email,
        subject: "Response from BakeHub Support",
        html: `
          <h2>Hello ${msg.name},</h2>
          <p>${replyText}</p>
          <br/>
          <p>Regards,<br/>BakeHub Support Team</p>
        `,
      });
    } catch (emailErr) {
      console.log("EMAIL SEND ERROR:", emailErr);
      return res.status(400).json({
        message: "Failed to send email",
        error: emailErr.message,
      });
    }

    /* -------------------------------
       SAVE REPLY IN DATABASE
    -------------------------------- */
    msg.adminReply = replyText;
    msg.replyAt = new Date();
    msg.status = "replied";
    await msg.save();

    res.json({ message: "Reply sent successfully", data: msg });

  } catch (err) {
    console.log("Reply Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =======================================================
   5️⃣ ADMIN — MARK AS RESOLVED
======================================================= */
export const resolveMessage = async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { status: "resolved" },
      { new: true }
    );

    if (!msg) return res.status(404).json({ message: "Message not found" });

    res.json({ message: "Message marked as resolved", data: msg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
