import express from "express";
import { protect } from "../middlewares/auth.js";
import {
  clearAllNotifications,
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/", protect, getNotifications);
notificationRouter.post("/read", protect, markAsRead);
notificationRouter.post("/read-all", protect, markAllAsRead);
notificationRouter.delete("/clear", protect, clearAllNotifications);

export default notificationRouter;
