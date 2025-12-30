import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import initSocket from "./socket.js";
import http from "http";

const PORT = process.env.PORT || 5000;

// Connect Database and Start Server
connectDB()
  .then(() => {
    const server = http.createServer(app);

    // ⚡ Init Socket.IO
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`🔥 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to Database", err);
    process.exit(1);
  });
