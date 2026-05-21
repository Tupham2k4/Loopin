import express from "express";
import cors from "cors";
import "dotenv/config";
import { serve } from "inngest/express";
import connectDB from "./configs/db.js";
import { inngest, functions } from "./inngest/index.js";
import { clerkMiddleware } from "@clerk/express";
import userRouter from "./routes/userRoutes.js";
<<<<<<< HEAD
import postRouter from "./routes/postRoutes.js";
import storyRouter from "./routes/storyRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
=======
>>>>>>> eb09b8edbc0eefaf5c6a2b3058c2cd2c44951bd0

const app = express();
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());
app.get("/", (req, res) => res.send("Server is running"));
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/user", userRouter);
<<<<<<< HEAD
app.use("/api/post", postRouter);
app.use("/api/story", storyRouter);
app.use("/api/message", messageRouter);
=======

>>>>>>> eb09b8edbc0eefaf5c6a2b3058c2cd2c44951bd0
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
