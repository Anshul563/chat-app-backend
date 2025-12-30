import mongoose from "mongoose";

const connectDB = async (uri) => {
  try {
    if (!uri) {
      console.error("❌ MongoDB Error: URI is missing!");
      process.exit(1);
    }
    await mongoose.connect(uri);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
