import express from "express";
import { protect } from "../middlewares/auth.js";
import {
  addComment,
  deleteComment,
  getCommentCounts,
  getComments,
  likeComment,
} from "../controllers/commentController.js";
const commentRouter = express.Router();
commentRouter.post("/add", protect, addComment);
commentRouter.get("/:postId", protect, getComments);
commentRouter.post("/like", protect, likeComment);
commentRouter.delete("/:commentId", protect, deleteComment);
commentRouter.post("/counts", protect, getCommentCounts);
export default commentRouter;
