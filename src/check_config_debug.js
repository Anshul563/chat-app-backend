import dotenv from "dotenv";
dotenv.config();

console.log("--- CONFIG CHECK ---");
console.log(
  "BREVO_API_KEY:",
  process.env.BREVO_API_KEY
    ? "SET (" + process.env.BREVO_API_KEY.length + " chars)"
    : "NOT SET"
);
console.log("BF_SENDER_EMAIL:", process.env.BF_SENDER_EMAIL || "NOT SET");
console.log("--- END CHECK ---");
