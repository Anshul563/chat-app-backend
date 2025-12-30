import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

async function main() {
  try {
    const user = process.env.BREVO_SMTP_USER;
    if (!user) {
      throw new Error("BREVO_SMTP_USER is undefined");
    }
    console.log("Attempting to verify transporter...");
    await transporter.verify();
    console.log("Transporter verified. Attempting to send email...");

    await transporter.sendMail({
      from: `"Test" <${user}>`,
      to: user, // Send to self
      subject: "Test Email via Brevo",
      text: "If you receive this, Brevo config is working.",
    });
    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Email failed:", error);
  }
}

main();
