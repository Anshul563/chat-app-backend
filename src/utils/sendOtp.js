import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// 🔍 DEBUG: check env values
console.log("DEBUG BREVO USER:", process.env.BREVO_SMTP_USER);
console.log("DEBUG BREVO PASS:", process.env.BREVO_SMTP_PASS);

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

export const sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"Chat App" <${process.env.BREVO_SMTP_USER}>`,
    to: email,
    subject: "Your OTP Code",
    html: `
      <h2>Email Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>Valid for 5 minutes</p>
    `,
  });
};
