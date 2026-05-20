import express from "express";
import cors from "cors";
import "dotenv/config";
import { serve } from "inngest/express";
import connectDB from "./configs/db.js";
import { inngest, functions } from "./inngest/index.js";
import { clerkMiddleware } from "@clerk/express";
import userRouter from "./routes/userRoutes.js";

const app = express();
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => res.send("Server is running"));
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/user", userRouter);

let _dbConnected = false;
async function ensureDbConnection() {
  if (_dbConnected) return;
  await connectDB();
  _dbConnected = true;
}

// Export a serverless-compatible handler for Vercel
export default async function handler(req, res) {
  try {
    await ensureDbConnection();
    return app(req, res);
  } catch (err) {
    console.error("Server handler error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// If running locally (not on Vercel), start a standalone server
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 4000;
  ensureDbConnection()
    .then(() => {
      app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    })
    .catch((err) => console.error("Failed to connect DB locally:", err));
}
