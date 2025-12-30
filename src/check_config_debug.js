import "dotenv/config";

console.log("--- CONFIG CHECK ---");
console.log(
  "BREVO_SMTP_USER:",
  process.env.BREVO_SMTP_USER
    ? "SET (" + process.env.BREVO_SMTP_USER.length + " chars)"
    : "NOT SET"
);
console.log(
  "BREVO_SMTP_PASS:",
  process.env.BREVO_SMTP_PASS
    ? "SET (" + process.env.BREVO_SMTP_PASS.length + " chars)"
    : "NOT SET"
);
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI ? "SET" : "NOT SET");
console.log("--- END CHECK ---");
