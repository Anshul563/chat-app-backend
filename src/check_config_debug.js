import dotenv from "dotenv";
dotenv.config();

console.log("--- CONFIG CHECK ---");
console.log(
  "EMAIL_USER:",
  process.env.EMAIL_USER
    ? "SET (" + process.env.EMAIL_USER.length + " chars)"
    : "NOT SET"
);
console.log(
  "EMAIL_PASS:",
  process.env.EMAIL_PASS
    ? "SET (" + process.env.EMAIL_PASS.length + " chars)"
    : "NOT SET"
);
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI ? "SET" : "NOT SET");
console.log("--- END CHECK ---");
