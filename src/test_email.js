import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function main() {
  try {
    const user = process.env.EMAIL_USER;
    if (!user) {
      throw new Error("EMAIL_USER is undefined");
    }
    console.log("Attempting to verify transporter...");
    await transporter.verify();
    console.log("Transporter verified. Attempting to send email...");

    await transporter.sendMail({
      from: `"Test" <${user}>`,
      to: user, // Send to self
      subject: "Test Email",
      text: "If you receive this, email config is working.",
    });
    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Email failed:", error);
  }
}

main();
